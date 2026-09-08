import { IDocumentSourceAdapter, VerifiedCredential } from './interfaces';

export class MockDigiLockerAdapter implements IDocumentSourceAdapter {
  public sourceName = 'DigiLocker Mock Adapter (Demo)';

  async fetchVerifiedCredentials(
    _citizenId: string,
    requestedDocTypes: string[]
  ): Promise<VerifiedCredential[]> {
    // In demo environment, returns simulated mock credentials
    const sampleCredentials: VerifiedCredential[] = [
      {
        id: 'doc-cbse-12',
        name: 'Class XII Senior School Marksheet',
        docType: 'Marksheet',
        issuer: 'Central Board of Secondary Education (CBSE)',
        issueDate: '24 May 2023',
        docNumber: 'CBSE/2023/849201',
        verified: true,
        category: 'education',
      },
      {
        id: 'doc-aadhaar',
        name: 'Aadhaar Identity Card (e-KYC)',
        docType: 'Identity Document',
        issuer: 'Unique Identification Authority of India (UIDAI)',
        issueDate: '12 Jan 2021',
        docNumber: 'UIDAI-XXXX-4921',
        verified: true,
        category: 'identity',
      },
      {
        id: 'doc-elec',
        name: 'Electricity Utility Consumer Bill',
        docType: 'Address Information',
        issuer: 'State Electricity Distribution Co.',
        issueDate: '10 Aug 2026',
        docNumber: 'EB-2024-8841',
        verified: true,
        category: 'address',
      },
      {
        id: 'doc-income-affidavit',
        name: 'Notarized Income Self-Declaration',
        docType: 'Salary / Income Proof',
        issuer: 'Sub-Divisional Magistrate / Notary',
        issueDate: '15 Jul 2026',
        docNumber: 'AFF-REV-99120',
        verified: true,
        category: 'income',
      },
    ];

    if (!requestedDocTypes || requestedDocTypes.length === 0) {
      return sampleCredentials;
    }

    return sampleCredentials.filter((cred) =>
      requestedDocTypes.some((req) => req.toLowerCase().includes(cred.docType.toLowerCase()) || cred.name.toLowerCase().includes(req.toLowerCase()))
    );
  }

  async verifyCredentialHash(docId: string): Promise<{ verified: boolean; issuerSignature: string }> {
    return {
      verified: true,
      issuerSignature: `SHA256:ECDSA-MOCK-SIG-${docId}-${Date.now().toString(36).toUpperCase()}`,
    };
  }
}
