export type NormalizedDocumentType =
  | 'IDENTITY_AADHAAR'
  | 'IDENTITY_PAN'
  | 'EDUCATION_MARKSHEET_10'
  | 'EDUCATION_MARKSHEET'
  | 'INCOME_CERTIFICATE'
  | 'DOMICILE_CERTIFICATE'
  | 'ADDRESS_PROOF_UTILITY'
  | 'CASTE_CERTIFICATE'
  | 'BANK_ACCOUNT_PROOF'
  | 'GENERIC_DOCUMENT';

export interface NormalizedDocumentDescriptor {
  type: NormalizedDocumentType;
  standardName: string;
  category: 'identity' | 'education' | 'income' | 'address' | 'transport';
  description: string;
  aliases: string[];
}

export const NORMALIZED_CATALOG: Record<NormalizedDocumentType, NormalizedDocumentDescriptor> = {
  IDENTITY_AADHAAR: {
    type: 'IDENTITY_AADHAAR',
    standardName: 'Aadhaar Identity Card (e-KYC)',
    category: 'identity',
    description: 'UIDAI biometric-verified identity record',
    aliases: [
      'aadhaar',
      'aadhaar card',
      'aadhaar identity card',
      'aadhaar e-kyc',
      'identity document',
      'uidai',
      'aadhaar identity card (e-kyc)',
      'national id',
    ],
  },
  IDENTITY_PAN: {
    type: 'IDENTITY_PAN',
    standardName: 'Permanent Account Number (PAN) Card',
    category: 'identity',
    description: 'Income Tax Department verified tax ID card',
    aliases: ['pan', 'pan card', 'permanent account number', 'pan verification record', 'tax identity'],
  },
  EDUCATION_MARKSHEET_10: {
    type: 'EDUCATION_MARKSHEET_10',
    standardName: 'Class X Secondary School Marksheet',
    category: 'education',
    description: 'Board certified secondary school grade transcript & age proof',
    aliases: [
      'class 10',
      'class x',
      '10th certificate',
      '10th marksheet',
      'matriculation',
      'class x marksheet',
      'class 10th marksheet',
      'age proof marksheet',
      'secondary school marksheet',
      'secondary certificate',
    ],
  },
  EDUCATION_MARKSHEET: {
    type: 'EDUCATION_MARKSHEET',
    standardName: 'Class XII Senior School Marksheet',
    category: 'education',
    description: 'Board certified senior secondary academic credential',
    aliases: [
      'class 12',
      'class xii',
      '12th certificate',
      '12th marksheet',
      'class xii senior school marksheet',
      'senior secondary marksheet',
      'higher secondary certificate',
      'hsc',
      'class 10/12 marksheet',
      'marksheet',
    ],
  },
  INCOME_CERTIFICATE: {
    type: 'INCOME_CERTIFICATE',
    standardName: 'Income & Asset Certificate',
    category: 'income',
    description: 'Revenue authority or attested declaration of household annual income',
    aliases: [
      'income',
      'income proof',
      'income certificate',
      'salary proof',
      'salary / income proof',
      'income self-declaration',
      'notarized income self-declaration',
      'income affidavit',
      'annual income proof',
    ],
  },
  DOMICILE_CERTIFICATE: {
    type: 'DOMICILE_CERTIFICATE',
    standardName: 'Residence & Domicile Certificate',
    category: 'address',
    description: 'State revenue proof of continuous residence and local domicile',
    aliases: [
      'domicile',
      'residence',
      'domicile certificate',
      'residence certificate',
      'residence proof',
      'proof of 10-year stay',
      'native certificate',
    ],
  },
  ADDRESS_PROOF_UTILITY: {
    type: 'ADDRESS_PROOF_UTILITY',
    standardName: 'Electricity / Utility Consumer Bill',
    category: 'address',
    description: 'Verified utility provider active billing statement for residence proof',
    aliases: [
      'utility bill',
      'electricity bill',
      'electricity utility consumer bill',
      'address information',
      'address proof (electricity bill)',
      'water bill',
      'gas utility bill',
    ],
  },
  CASTE_CERTIFICATE: {
    type: 'CASTE_CERTIFICATE',
    standardName: 'Community / Social Category Certificate',
    category: 'identity',
    description: 'Competent revenue magistrate reservation or category validation',
    aliases: [
      'caste',
      'caste certificate',
      'community certificate',
      'category certificate',
      'sc/st/obc certificate',
      'social welfare category',
      'social category / caste certificate',
    ],
  },
  BANK_ACCOUNT_PROOF: {
    type: 'BANK_ACCOUNT_PROOF',
    standardName: 'Bank Account Passbook / IFSC Verification',
    category: 'income',
    description: 'Nationalized bank account proof for Direct Benefit Transfer disbursements',
    aliases: [
      'bank',
      'bank account proof',
      'bank passbook',
      'bank passbook / ifsc',
      'cancelled cheque',
      'ifsc proof',
      'bank statement',
    ],
  },
  GENERIC_DOCUMENT: {
    type: 'GENERIC_DOCUMENT',
    standardName: 'Supporting Document',
    category: 'identity',
    description: 'Unclassified supporting attachment',
    aliases: ['document', 'supporting document', 'other'],
  },
};

export class DocumentNormalizationService {
  /**
   * Normalizes any heterogeneous document string, name, or source identifier into a SevaSetu standard type.
   */
  public normalizeDocumentType(rawTypeOrName: string): NormalizedDocumentType {
    if (!rawTypeOrName || typeof rawTypeOrName !== 'string') {
      return 'GENERIC_DOCUMENT';
    }

    const cleaned = rawTypeOrName.trim().toLowerCase();

    // Direct match against known catalog keys
    if (NORMALIZED_CATALOG[cleaned.toUpperCase() as NormalizedDocumentType]) {
      return cleaned.toUpperCase() as NormalizedDocumentType;
    }

    // Collect all aliases and sort by length descending (longest match wins)
    const allAliases: { alias: string; type: NormalizedDocumentType }[] = [];
    for (const [normType, desc] of Object.entries(NORMALIZED_CATALOG)) {
      for (const alias of desc.aliases) {
        allAliases.push({ alias: alias.toLowerCase(), type: normType as NormalizedDocumentType });
      }
    }
    allAliases.sort((a, b) => b.alias.length - a.alias.length);

    for (const item of allAliases) {
      if (cleaned === item.alias || cleaned.includes(item.alias) || item.alias.includes(cleaned)) {
        return item.type;
      }
    }

    return 'GENERIC_DOCUMENT';
  }

  /**
   * Returns human-readable standard name for a normalized document type.
   */
  public getStandardName(type: NormalizedDocumentType): string {
    return NORMALIZED_CATALOG[type]?.standardName || type;
  }

  /**
   * Checks whether a candidate document matches a required document specification.
   */
  public matchesRequirement(candidate: string, requirement: string): boolean {
    if (!candidate || !requirement) return false;
    const normCandidate = this.normalizeDocumentType(candidate);
    const normRequirement = this.normalizeDocumentType(requirement);

    if (normCandidate !== 'GENERIC_DOCUMENT' && normRequirement !== 'GENERIC_DOCUMENT') {
      return normCandidate === normRequirement;
    }

    // Fallback: substring matching on raw strings
    const cClean = candidate.toLowerCase().trim();
    const rClean = requirement.toLowerCase().trim();
    return cClean.includes(rClean) || rClean.includes(cClean);
  }

  /**
   * Returns category for a normalized document type.
   */
  public getCategory(type: NormalizedDocumentType): 'identity' | 'education' | 'income' | 'address' | 'transport' {
    return NORMALIZED_CATALOG[type]?.category || 'identity';
  }
}

export const normalizationService = new DocumentNormalizationService();
