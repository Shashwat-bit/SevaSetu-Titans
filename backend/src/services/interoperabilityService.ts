import { Service } from '../models/Service';
import { Application, IApplication } from '../models/Application';
import { Consent, IConsent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { DataExchange, IDataExchange } from '../models/DataExchange';
import { getDepartmentAdapter, getDocumentSourceAdapter, getAllDepartmentAdapters } from '../adapters/adapterFactory';
import { normalizationService } from './normalizationService';
import { VerifiedCredential } from '../adapters/interfaces';
import { AppError } from '../middleware/errorHandler';
import { AuthTokenPayload } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

export interface SimulatedAdapterHealth {
  id: string;
  name: string;
  type: 'DOCUMENT_SOURCE' | 'DEPARTMENT_SYSTEM';
  status: 'CONNECTED' | 'AVAILABLE' | 'DEGRADED' | 'DISCONNECTED';
  protocol: string;
  latencyMs: number;
  lastPing: string;
  isMock: true;
  label: string;
}

export class InteroperabilityService {
  /**
   * Retrieves required documents and fields for a service from the backend registry.
   */
  async getServiceRequirements(serviceId: string) {
    const service = await Service.findOne({ serviceId });
    if (!service) {
      throw new AppError(`Service with ID "${serviceId}" not found`, 404);
    }

    const deptAdapter = getDepartmentAdapter(service.departmentId);
    let requiredDocs = service.requiredDocs;
    let requiredFields = service.requiredFields;

    // Harmonize with department adapter definitions if available
    try {
      const adapterData = await deptAdapter.getServiceData(serviceId);
      if (adapterData.requiredDocuments && adapterData.requiredDocuments.length > 0) {
        requiredDocs = adapterData.requiredDocuments;
      }
      if (adapterData.requiredFields && adapterData.requiredFields.length > 0) {
        requiredFields = adapterData.requiredFields;
      }
    } catch {
      // Fallback to Service model catalog definitions
    }

    const normalizedRequiredTypes = requiredDocs.map((doc) => normalizationService.normalizeDocumentType(doc));

    return {
      serviceId: service.serviceId,
      serviceTitle: service.title,
      departmentId: service.departmentId,
      departmentName: service.departmentName,
      category: service.category,
      processingDays: service.processingDays,
      fee: service.fee,
      requiredDocuments: requiredDocs,
      requiredFields,
      normalizedRequiredTypes,
    };
  }

  /**
   * Fetches available documents from the mock DigiLocker vault for an authenticated citizen.
   */
  async getCitizenVaultDocuments(citizenId: string): Promise<VerifiedCredential[]> {
    const sourceAdapter = getDocumentSourceAdapter();
    const docs = await sourceAdapter.getAvailableDocuments(citizenId);

    // Ensure all documents have normalized types and masked references
    return docs.map((d) => ({
      ...d,
      normalizedType: normalizationService.normalizeDocumentType(d.name || d.docType),
      maskedReferenceNumber: d.maskedReferenceNumber || d.docNumber,
    }));
  }

  /**
   * Validates active citizen consent for a department and service.
   */
  async validateConsent(citizenId: string, departmentId: string, applicationId?: string): Promise<IConsent> {
    let consent: IConsent | null = null;

    if (applicationId) {
      // Look for application-specific consent first
      consent = await Consent.findOne({ citizenId, departmentId, whichApplicationId: applicationId });

      if (!consent) {
        // Only allow general/blanket consent if whichApplicationId is unset or GENERAL
        // An existing consent belonging to ANOTHER application must NEVER authorize this application!
        consent = await Consent.findOne({
          citizenId,
          departmentId,
          $or: [
            { whichApplicationId: '' },
            { whichApplicationId: 'GENERAL' },
            { whichApplicationId: { $exists: false } },
          ],
        }).sort({ createdAt: -1 });
      }
    } else {
      consent = await Consent.findOne({ citizenId, departmentId }).sort({ createdAt: -1 });
    }

    if (!consent) {
      throw new AppError(
        `Consent required. No citizen consent found authorizing ${departmentId} for ${applicationId || 'credential access'}.`,
        403
      );
    }

    // Check citizen ownership
    if (consent.citizenId !== citizenId) {
      throw new AppError('Forbidden. Consent belongs to another citizen.', 403);
    }

    // Check application isolation: Consent for another application must not authorize this application
    if (
      applicationId &&
      consent.whichApplicationId &&
      consent.whichApplicationId !== applicationId &&
      consent.whichApplicationId !== 'GENERAL'
    ) {
      throw new AppError(
        `Forbidden. Consent ${consent.consentId} is authorized for application ${consent.whichApplicationId}, not ${applicationId}.`,
        403
      );
    }

    const statusUpper = (consent.status || '').toUpperCase();

    // Check revoked status
    if (statusUpper === 'ACCESS REVOKED' || statusUpper === 'REVOKED') {
      throw new AppError(
        `Consent required. Consent for application ${applicationId || consent.whichApplicationId} has been revoked.`,
        403
      );
    }

    // Check denied status
    if (statusUpper === 'DENIED') {
      throw new AppError(
        `Consent required. Consent for application ${applicationId || consent.whichApplicationId} was denied.`,
        403
      );
    }

    // Check expiration date
    const expirationStr = consent.expiresAt || consent.untilWhen;
    if (expirationStr) {
      const expDate = new Date(expirationStr);
      if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
        if (consent.status !== 'Expired' && consent.status !== 'EXPIRED') {
          consent.status = 'Expired';
          await consent.save();
        }
        throw new AppError(
          `Consent expired. Consent for application ${applicationId || consent.whichApplicationId} expired on ${expirationStr}.`,
          403
        );
      }
    }

    // Check expired status flag
    if (statusUpper === 'EXPIRED') {
      throw new AppError(
        `Consent expired. Consent for application ${applicationId || consent.whichApplicationId} has expired.`,
        403
      );
    }

    // Status must be ACTIVE or GRANTED
    if (statusUpper !== 'ACTIVE' && statusUpper !== 'GRANTED') {
      throw new AppError(
        `Consent required. Consent status is ${consent.status}.`,
        403
      );
    }

    return consent;
  }

  /**
   * Performs a secure document exchange:
   * 1. Validates authentication & authorization
   * 2. Checks active citizen consent (blocks if revoked or missing)
   * 3. Enforces server-side filtering (only required docs permitted)
   * 4. Fetches & normalizes external credential
   * 5. Creates DataExchange and Activity audit records
   */
  async requestDocumentExchange(params: {
    applicationId: string;
    documentId: string;
    user: AuthTokenPayload;
    purpose?: string;
  }): Promise<{ exchange: IDataExchange; document: VerifiedCredential }> {
    const { applicationId, documentId, user } = params;
    const nowFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Fetch application
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }

    // 2. Authorization check
    if (user.role === 'citizen') {
      if (app.citizenId !== user.citizenId && app.citizenId !== user.userId) {
        throw new AppError('Forbidden. You may only access your own applications.', 403);
      }
    } else if (user.role === 'officer') {
      if (app.departmentId !== user.departmentId) {
        throw new AppError(`Forbidden. You may only access applications for department ${user.departmentId}.`, 403);
      }
    } else {
      throw new AppError('Forbidden. Unauthorized role.', 403);
    }

    // 3. Verify Active Consent
    let activeConsent: IConsent | null = null;
    try {
      activeConsent = await this.validateConsent(app.citizenId, app.departmentId, app.applicationId);
    } catch (err: any) {
      const errMsg = err.message || 'Missing or revoked citizen consent';

      // Record denied exchange attempt in audit log
      await DataExchange.create({
        exchangeId: `xchg-denied-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        applicationId: app.applicationId,
        citizenId: app.citizenId,
        documentId,
        documentType: 'UNKNOWN',
        normalizedType: 'UNKNOWN',
        sourceSystem: 'DigiLocker Mock Adapter (Demo)',
        targetDepartment: app.departmentId,
        purpose: params.purpose || `${app.serviceName} verification`,
        requestedAt: nowFormatted,
        status: 'DENIED',
        requestedBy: user.id || user.userId,
        requestedByName: user.name,
        metadata: { reason: errMsg },
      });

      await Activity.create({
        activityId: `act-denied-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: 'Data Access Denied - Consent Missing or Revoked',
        details: `Access request for document "${documentId}" rejected: ${errMsg}`,
        type: 'data_access_denied',
        statusBadge: 'Denied',
        timestamp: nowFormatted,
        metadata: { requestedBy: user.id || user.userId, officerRole: user.role, reason: errMsg },
      });

      throw new AppError(
        errMsg.startsWith('Data access') ? errMsg : `Data access blocked: ${errMsg}`,
        403
      );
    }

    // 4. Retrieve document from Mock DigiLocker Adapter
    const sourceAdapter = getDocumentSourceAdapter();
    const rawDoc = await sourceAdapter.getDocument(app.citizenId, documentId);

    if (!rawDoc) {
      throw new AppError(`Document with ID "${documentId}" was not found in citizen document vault.`, 404);
    }

    // 5. Server-side explicit filtering check:
    // Is this document permitted for the application's service requirements or consent?
    const serviceReqs = await this.getServiceRequirements(app.serviceId);
    const normalizedType = normalizationService.normalizeDocumentType(rawDoc.name || rawDoc.docType);

    const isExplicitlyAttached = app.documentsAttached.some(
      (d) => d.docId === documentId || d.name.toLowerCase() === rawDoc.name.toLowerCase()
    );
    const isServiceRequirement = serviceReqs.normalizedRequiredTypes.includes(normalizedType);
    const isConsentAuthorized = activeConsent.whatData.some((item) =>
      normalizationService.matchesRequirement(rawDoc.name, item)
    );

    if (!isExplicitlyAttached && !isServiceRequirement && !isConsentAuthorized) {
      await DataExchange.create({
        exchangeId: `xchg-denied-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        applicationId: app.applicationId,
        citizenId: app.citizenId,
        documentId,
        documentType: rawDoc.docType || 'UNKNOWN',
        normalizedType,
        sourceSystem: sourceAdapter.sourceName,
        targetDepartment: app.departmentId,
        purpose: params.purpose || `${app.serviceName} verification`,
        requestedAt: nowFormatted,
        status: 'DENIED',
        requestedBy: user.id || user.userId,
        requestedByName: user.name,
        metadata: { reason: `Document "${rawDoc.name}" is not required for ${app.serviceName}` },
      });

      await Activity.create({
        activityId: `act-denied-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        citizenId: app.citizenId,
        applicationId: app.applicationId,
        serviceName: app.serviceName,
        departmentName: app.departmentName,
        action: 'Data Access Denied - Document Not Required',
        details: `Access request for "${rawDoc.name}" rejected because it is not required for ${app.serviceName}.`,
        type: 'data_access_denied',
        statusBadge: 'Denied',
        timestamp: nowFormatted,
        metadata: { requestedBy: user.id || user.userId, officerRole: user.role },
      });

      throw new AppError(
        `Data access denied: Document "${rawDoc.name}" is not required for ${app.serviceName} or authorized by consent.`,
        403
      );
    }

    // 6. Cryptographic signature validation simulation
    const hashValidation = await sourceAdapter.verifyDocument(documentId);

    // 7. Record successful DataExchange
    const exchange = await DataExchange.create({
      exchangeId: `xchg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      applicationId: app.applicationId,
      citizenId: app.citizenId,
      documentId: rawDoc.id || documentId,
      documentType: rawDoc.docType,
      normalizedType,
      sourceSystem: sourceAdapter.sourceName,
      targetDepartment: app.departmentId,
      purpose: params.purpose || `${app.serviceName} eligibility verification`,
      consentId: activeConsent.consentId,
      requestedAt: nowFormatted,
      accessedAt: nowFormatted,
      status: 'FETCHED',
      requestedBy: user.id || user.userId,
      requestedByName: user.name,
      metadata: {
        issuer: rawDoc.issuer,
        maskedReference: rawDoc.maskedReferenceNumber,
        signature: hashValidation.issuerSignature,
      },
    });

    // 8. Log Activity Audit
    await Activity.create({
      activityId: `act-fetch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      citizenId: app.citizenId,
      applicationId: app.applicationId,
      serviceName: app.serviceName,
      departmentName: app.departmentName,
      action: `Document Exchanged - ${rawDoc.name}`,
      details: `Retrieved "${rawDoc.name}" via ${sourceAdapter.sourceName} for ${app.serviceName}. Consent ID: ${activeConsent.consentId}`,
      type: 'document_exchanged',
      statusBadge: 'Exchanged',
      timestamp: nowFormatted,
      metadata: {
        exchangeId: exchange.exchangeId,
        normalizedType,
        consentId: activeConsent.consentId,
      },
    });

    logger.info(`[Interop] Document exchanged: ${rawDoc.name} for app ${applicationId} by ${user.name}`);

    return { exchange, document: rawDoc };
  }

  /**
   * Returns live simulated health and connectivity of all mock external adapters.
   */
  getSimulatedAdapterStatuses(): SimulatedAdapterHealth[] {
    const now = new Date().toISOString();

    const adapters: SimulatedAdapterHealth[] = [
      {
        id: 'adapter-digilocker',
        name: 'DigiLocker Mock Adapter (Demo Node)',
        type: 'DOCUMENT_SOURCE',
        status: 'CONNECTED',
        protocol: 'Simulated OAuth 2.0 / Cryptographic Hash Verification',
        latencyMs: 42,
        lastPing: now,
        isMock: true,
        label: 'Prototype Simulation — UIDAI / CBSE Vault',
      },
    ];

    const deptAdapters = getAllDepartmentAdapters();
    for (const d of deptAdapters) {
      adapters.push({
        id: `adapter-${d.departmentId}`,
        name: `${d.adapter.departmentName} (Simulated Dispatch Node)`,
        type: 'DEPARTMENT_SYSTEM',
        status: 'AVAILABLE',
        protocol: 'RESTful Service Interoperability Protocol (Mock)',
        latencyMs: Math.floor(35 + Math.random() * 25),
        lastPing: now,
        isMock: true,
        label: `Prototype Simulation — ${d.adapter.departmentCode}`,
      });
    }

    return adapters;
  }

  /**
   * Retrieves data exchanges for an application, enforcing access control.
   */
  async getApplicationExchanges(applicationId: string, user: AuthTokenPayload): Promise<IDataExchange[]> {
    const app = await Application.findOne({ applicationId });
    if (!app) {
      throw new AppError(`Application ${applicationId} not found`, 404);
    }

    if (user.role === 'citizen') {
      if (app.citizenId !== user.citizenId && app.citizenId !== user.userId) {
        throw new AppError('Forbidden. You may only view exchanges for your own applications.', 403);
      }
    } else if (user.role === 'officer') {
      if (app.departmentId !== user.departmentId) {
        throw new AppError(`Forbidden. You may only view applications in department ${user.departmentId}.`, 403);
      }
    }

    return DataExchange.find({ applicationId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves all data exchanges for a citizen's personal audit stream.
   */
  async getCitizenExchanges(citizenId: string, user: AuthTokenPayload): Promise<IDataExchange[]> {
    if (user.role === 'citizen' && user.citizenId !== citizenId && user.userId !== citizenId) {
      throw new AppError('Forbidden. You may only view your own data exchange records.', 403);
    }

    return DataExchange.find({ citizenId }).sort({ createdAt: -1 });
  }
}

export const interoperabilityService = new InteroperabilityService();
