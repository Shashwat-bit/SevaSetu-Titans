import { IDocumentSourceAdapter, VerifiedCredential } from './interfaces';
import { normalizationService } from '../services/normalizationService';

export class MockDigiLockerAdapter implements IDocumentSourceAdapter {
  public sourceName = 'DigiLocker Mock Adapter (Demo)';
  private isConnected: boolean = true;

  // Realistic simulated citizen document vault
  private readonly mockVault: VerifiedCredential[] = [
    {
      id: 'doc-aadhaar',
      documentId: 'doc-aadhaar',
      name: 'Aadhaar Identity Card (e-KYC)',
      documentName: 'Aadhaar Identity Card (e-KYC)',
      docType: 'Identity Document',
      documentType: 'IDENTITY_AADHAAR',
      normalizedType: 'IDENTITY_AADHAAR',
      issuer: 'Unique Identification Authority of India (UIDAI)',
      issueDate: '12 Jan 2021',
      issuedDate: '12 Jan 2021',
      docNumber: 'UIDAI-XXXX-4921',
      maskedReferenceNumber: 'XXXX-XXXX-4921',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'identity',
      available: true,
      lastUpdated: '12 Jan 2021, 10:00 AM',
    },
    {
      id: 'doc-pan',
      documentId: 'doc-pan',
      name: 'Permanent Account Number (PAN) Card',
      documentName: 'Permanent Account Number (PAN) Card',
      docType: 'Tax Identity',
      documentType: 'IDENTITY_PAN',
      normalizedType: 'IDENTITY_PAN',
      issuer: 'Income Tax Department (Govt. of India)',
      issueDate: '05 Mar 2022',
      issuedDate: '05 Mar 2022',
      docNumber: 'ABCDE1234F',
      maskedReferenceNumber: 'XXXXX1234F',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'identity',
      available: true,
      lastUpdated: '05 Mar 2022, 11:30 AM',
    },
    {
      id: 'doc-cbse-10',
      documentId: 'doc-cbse-10',
      name: 'Class X Secondary School Marksheet',
      documentName: 'Class X Secondary School Marksheet',
      docType: 'Marksheet',
      documentType: 'EDUCATION_MARKSHEET_10',
      normalizedType: 'EDUCATION_MARKSHEET_10',
      issuer: 'Central Board of Secondary Education (CBSE)',
      issueDate: '15 Jul 2021',
      issuedDate: '15 Jul 2021',
      docNumber: 'CBSE/2021/654321',
      maskedReferenceNumber: 'CBSE/2021/XXXXXX',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'education',
      available: true,
      lastUpdated: '15 Jul 2021, 02:15 PM',
    },
    {
      id: 'doc-cbse-12',
      documentId: 'doc-cbse-12',
      name: 'Class XII Senior School Marksheet',
      documentName: 'Class XII Senior School Marksheet',
      docType: 'Marksheet',
      documentType: 'EDUCATION_MARKSHEET',
      normalizedType: 'EDUCATION_MARKSHEET',
      issuer: 'Central Board of Secondary Education (CBSE)',
      issueDate: '24 May 2023',
      issuedDate: '24 May 2023',
      docNumber: 'CBSE/2023/849201',
      maskedReferenceNumber: 'CBSE/2023/XXXXXX',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'education',
      available: true,
      lastUpdated: '24 May 2023, 04:45 PM',
    },
    {
      id: 'doc-domicile',
      documentId: 'doc-domicile',
      name: 'Residence & Domicile Certificate',
      documentName: 'Residence & Domicile Certificate',
      docType: 'Residence Proof',
      documentType: 'DOMICILE_CERTIFICATE',
      normalizedType: 'DOMICILE_CERTIFICATE',
      issuer: 'Revenue Department (Tehsil Office, Gandhinagar)',
      issueDate: '18 Nov 2022',
      issuedDate: '18 Nov 2022',
      docNumber: 'DOM-GUJ-2022-99881',
      maskedReferenceNumber: 'DOM-XXXX-99881',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'address',
      available: true,
      lastUpdated: '18 Nov 2022, 12:00 PM',
    },
    {
      id: 'doc-income',
      documentId: 'doc-income',
      name: 'Income & Asset Certificate',
      documentName: 'Income & Asset Certificate',
      docType: 'Salary / Income Proof',
      documentType: 'INCOME_CERTIFICATE',
      normalizedType: 'INCOME_CERTIFICATE',
      issuer: 'Sub-Divisional Magistrate / Mamlatdar Office',
      issueDate: '15 Jul 2026',
      issuedDate: '15 Jul 2026',
      docNumber: 'INC-2026-48210',
      maskedReferenceNumber: 'XXXX-4821',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'income',
      available: true,
      lastUpdated: '15 Jul 2026, 03:20 PM',
    },
    {
      id: 'doc-elec',
      documentId: 'doc-elec',
      name: 'Electricity Utility Consumer Bill',
      documentName: 'Electricity Utility Consumer Bill',
      docType: 'Address Information',
      documentType: 'ADDRESS_PROOF_UTILITY',
      normalizedType: 'ADDRESS_PROOF_UTILITY',
      issuer: 'State Electricity Distribution Co. (UGVCL)',
      issueDate: '10 Aug 2026',
      issuedDate: '10 Aug 2026',
      docNumber: 'EB-2024-8841',
      maskedReferenceNumber: 'EB-XXXX-8841',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'address',
      available: true,
      lastUpdated: '10 Aug 2026, 09:10 AM',
    },
    {
      id: 'doc-caste',
      documentId: 'doc-caste',
      name: 'Social Category / Caste Certificate',
      documentName: 'Social Category / Caste Certificate',
      docType: 'Community Certificate',
      documentType: 'CASTE_CERTIFICATE',
      normalizedType: 'CASTE_CERTIFICATE',
      issuer: 'District Social Welfare Officer',
      issueDate: '22 Feb 2021',
      issuedDate: '22 Feb 2021',
      docNumber: 'SC-ST-OBC-7729',
      maskedReferenceNumber: 'CAST-XXXX-7729',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'identity',
      available: true,
      lastUpdated: '22 Feb 2021, 01:15 PM',
    },
    {
      id: 'doc-bank-proof',
      documentId: 'doc-bank-proof',
      name: 'Bank Account Passbook / IFSC Verification',
      documentName: 'Bank Account Passbook / IFSC Verification',
      docType: 'Bank Account Proof',
      documentType: 'BANK_ACCOUNT_PROOF',
      normalizedType: 'BANK_ACCOUNT_PROOF',
      issuer: 'State Bank of India (Public Sector Bank)',
      issueDate: '01 Jan 2025',
      issuedDate: '01 Jan 2025',
      docNumber: 'SBI-ACC-99881122',
      maskedReferenceNumber: 'SBI-XXXX-1122',
      verified: true,
      verificationStatus: 'VERIFIED',
      source: 'DigiLocker Mock Adapter (Demo)',
      category: 'income',
      available: true,
      lastUpdated: '01 Jan 2025, 10:00 AM',
    },
  ];

  async connect(): Promise<{ connected: boolean; source: string; status: string }> {
    this.isConnected = true;
    return {
      connected: true,
      source: this.sourceName,
      status: 'CONNECTED',
    };
  }

  async disconnect(): Promise<{ connected: boolean; status: string }> {
    this.isConnected = false;
    return {
      connected: false,
      status: 'DISCONNECTED',
    };
  }

  async getAvailableDocuments(_citizenId: string): Promise<VerifiedCredential[]> {
    return [...this.mockVault];
  }

  async getDocument(_citizenId: string, documentId: string): Promise<VerifiedCredential | null> {
    const doc = this.mockVault.find(
      (d) => d.id === documentId || d.documentId === documentId || d.name.toLowerCase() === documentId.toLowerCase()
    );
    return doc ? { ...doc } : null;
  }

  async verifyDocument(documentId: string): Promise<{ verified: boolean; issuerSignature: string }> {
    return {
      verified: true,
      issuerSignature: `SHA256:ECDSA-MOCK-SIG-${documentId}-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  async getCitizenData(_citizenId: string): Promise<Record<string, any>> {
    return {
      name: 'Tanishka',
      dateOfBirth: '14/05/2002',
      gender: 'Female',
      maskedAadhaar: 'XXXX-XXXX-4921',
      address: 'Flat 402, Sector 14, Gandhinagar, Gujarat - 382016',
      phone: '+91 98765 43210',
      isDigiLockerConnected: this.isConnected,
    };
  }

  async fetchVerifiedCredentials(
    _citizenId: string,
    requestedDocTypes: string[]
  ): Promise<VerifiedCredential[]> {
    if (!requestedDocTypes || requestedDocTypes.length === 0) {
      return [...this.mockVault];
    }

    return this.mockVault.filter((cred) =>
      requestedDocTypes.some((req) => normalizationService.matchesRequirement(cred.name, req))
    );
  }

  async verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }> {
    return this.verifyDocument(docId);
  }
}
