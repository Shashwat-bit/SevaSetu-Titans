import { CitizenDocument, ICitizenDocument } from '../models/Document';
import { getDocumentSourceAdapter } from '../adapters/adapterFactory';
import { AppError } from '../middleware/errorHandler';
import { AuthTokenPayload } from '../middleware/authMiddleware';

export class DocumentService {
  async getDocuments(citizenId: string = 'cit-001'): Promise<any[]> {
    let docs: any[] = await CitizenDocument.find({ citizenId });
    if (docs.length === 0) {
      // If none in DB, sync from mock adapter
      docs = await this.syncWithDigiLockerMock(citizenId);
    }
    return docs;
  }

  async syncWithDigiLockerMock(citizenId: string = 'cit-001'): Promise<any[]> {
    const adapter = getDocumentSourceAdapter();
    const creds = await adapter.fetchVerifiedCredentials(citizenId, []);

    for (const cred of creds) {
      await CitizenDocument.findOneAndUpdate(
        { documentId: cred.id, citizenId },
        {
          documentId: cred.id,
          citizenId,
          name: cred.name,
          docType: cred.docType,
          issuer: cred.issuer,
          issueDate: cred.issueDate,
          docNumber: cred.docNumber,
          verified: cred.verified,
          category: cred.category,
          source: 'MOCK_DIGILOCKER',
          verificationStatus: 'VERIFIED_MOCK',
        },
        { upsert: true, new: true }
      );
    }

    return CitizenDocument.find({ citizenId });
  }

  async verifyDocument(
    documentId: string,
    user?: AuthTokenPayload
  ): Promise<{ verified: boolean; issuerSignature: string }> {
    const doc = await CitizenDocument.findOne({ documentId });
    if (!doc) {
      throw new AppError(`Document ${documentId} not found`, 404);
    }

    if (user) {
      if (user.role === 'citizen' && doc.citizenId !== user.citizenId) {
        throw new AppError('Forbidden. You may only verify your own documents.', 403);
      }
      if (user.role === 'officer') {
        const { Application } = await import('../models/Application.js');
        const hasAccess = await Application.exists({
          departmentId: user.departmentId,
          'documentsAttached.docId': documentId,
        });
        if (!hasAccess) {
          throw new AppError(
            `Forbidden. Document is not attached to any application in department ${user.departmentId}.`,
            403
          );
        }
      }
    }

    const adapter = getDocumentSourceAdapter();
    return adapter.verifyCredentialHash(documentId);
  }
}

export const documentService = new DocumentService();
