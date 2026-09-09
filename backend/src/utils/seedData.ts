import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { Department } from '../models/Department';
import { Service } from '../models/Service';
import { Application } from '../models/Application';
import { CitizenDocument } from '../models/Document';
import { Consent } from '../models/Consent';
import { Activity } from '../models/Activity';
import { DataExchange } from '../models/DataExchange';
import { connectDB } from '../config/db';
import { logger } from './logger';

export const DEMO_PASSWORDS = {
  CITIZEN: 'Citizen@123',
  OFFICER_EDU: 'Officer@Edu123',
  OFFICER_REV: 'Officer@Rev123',
  OFFICER_TRANS: 'Officer@Trans123',
  ADMIN: 'Admin@123',
};

export const SEED_USERS = [
  {
    citizenId: 'cit-001',
    name: 'Tanishka',
    email: 'tanishka@example.com',
    phone: '+91 98765 43210',
    maskedAadhaar: 'XXXX-XXXX-4921',
    address: 'Flat 402, Sector 14, Gandhinagar, Gujarat - 382016',
    dateOfBirth: '14/05/2002',
    gender: 'Female',
    isDigiLockerConnected: true,
    connectedAt: '01 September 2026, 09:00 AM',
    role: 'citizen' as UserRole,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORDS.CITIZEN, 10),
  },
  {
    citizenId: 'officer-edu-001',
    name: 'Dr. Arvind Sharma (Higher Education Officer)',
    email: 'officer.edu@gov.in',
    phone: '+91 94280 11223',
    role: 'officer' as UserRole,
    departmentId: 'dept-edu',
    isDigiLockerConnected: false,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORDS.OFFICER_EDU, 10),
  },
  {
    citizenId: 'officer-rev-001',
    name: 'Smt. Rekha Patel (Mamlatdar / Revenue Officer)',
    email: 'officer.rev@gov.in',
    phone: '+91 94280 44556',
    role: 'officer' as UserRole,
    departmentId: 'dept-rev',
    isDigiLockerConnected: false,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORDS.OFFICER_REV, 10),
  },
  {
    citizenId: 'officer-trans-001',
    name: 'Shri Vikram Desai (RTO Transport Officer)',
    email: 'officer.trans@gov.in',
    phone: '+91 94280 77889',
    role: 'officer' as UserRole,
    departmentId: 'dept-trans',
    isDigiLockerConnected: false,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORDS.OFFICER_TRANS, 10),
  },
  {
    citizenId: 'admin-001',
    name: 'SevaSetu System Administrator',
    email: 'admin@sevasetu.gov.in',
    phone: '+91 99999 00000',
    role: 'admin' as UserRole,
    isDigiLockerConnected: false,
    passwordHash: bcrypt.hashSync(DEMO_PASSWORDS.ADMIN, 10),
  },
];

export const SEED_USER = SEED_USERS[0];

export const SEED_DEPARTMENTS = [
  {
    departmentId: 'dept-edu',
    name: 'Education Department',
    code: 'EDU-GOV',
    shortName: 'Education',
    category: 'Higher & Technical Education',
    description: 'Administers state & national scholarship schemes, academic accreditations, and student subsidies.',
    adapterStatus: 'Connected (Mock Adapter)',
    adapterIdentifier: 'MockEducationAdapter',
    active: true,
  },
  {
    departmentId: 'dept-rev',
    name: 'Revenue Department',
    code: 'REV-GOV',
    shortName: 'Revenue',
    category: 'Land, Certificates & Taxes',
    description: 'Issues citizen caste, income, domicile, and land title records through verified registrar nodes.',
    adapterStatus: 'Connected (Mock Adapter)',
    adapterIdentifier: 'MockRevenueAdapter',
    active: true,
  },
  {
    departmentId: 'dept-trans',
    name: 'Transport Department',
    code: 'RTO-GOV',
    shortName: 'Transport',
    category: 'RTO & Licensing',
    description: 'Handles motor vehicle registration, learner driving permits, and commercial transport fitness.',
    adapterStatus: 'Connected (Mock Adapter)',
    adapterIdentifier: 'MockTransportAdapter',
    active: true,
  },
  {
    departmentId: 'dept-welfare',
    name: 'Social Welfare Department',
    code: 'WEL-GOV',
    shortName: 'Social Welfare',
    category: 'Pensions & Affirmative Schemes',
    description: 'Manages senior citizen stipends, disability grants, ration subsidies, and family support.',
    adapterStatus: 'Connected (Mock Adapter)',
    adapterIdentifier: 'MockSocialWelfareAdapter',
    active: true,
  },
];

export const SEED_SERVICES = [
  {
    serviceId: 'service-scholarship',
    title: 'Post-Matric & Merit Scholarship',
    departmentId: 'dept-edu',
    departmentName: 'Education Department',
    category: 'scholarships' as const,
    categoryLabel: 'Scholarships',
    description: 'Financial assistance for college & university students pursuing higher degree programs.',
    requiredDocs: ['Class 10/12 Marksheet', 'Identity Document', 'Address Information'],
    requiredFields: ['College Name', 'Course & Year', 'Family Annual Income'],
    processingDays: '15-20 Working Days',
    fee: '₹0 (Free)',
    eligibility: 'Enrolled undergraduate/postgraduate student with min 60% aggregate',
    popular: true,
    active: true,
  },
  {
    serviceId: 'service-income',
    title: 'Income & Asset Certificate',
    departmentId: 'dept-rev',
    departmentName: 'Revenue Department',
    category: 'certificates' as const,
    categoryLabel: 'Certificates',
    description: 'Official revenue document establishing family annual income for fee waivers and quotas.',
    requiredDocs: ['Identity Document', 'Address Information', 'Salary / Income Proof'],
    requiredFields: ['Occupation of Parents', 'Total Annual Income (INR)', 'Taluka/Tehsil'],
    processingDays: '7-10 Working Days',
    fee: '₹50 (Government Fee)',
    eligibility: 'Resident citizen residing in the revenue sub-division',
    popular: true,
    active: true,
  },
  {
    serviceId: 'service-residence',
    title: 'Residence & Domicile Certificate',
    departmentId: 'dept-rev',
    departmentName: 'Revenue Department',
    category: 'residence' as const,
    categoryLabel: 'Residence Services',
    description: 'Proof of continuous residence in the state for government recruitment and state quotas.',
    requiredDocs: ['Identity Document', 'Address Proof (Electricity Bill)', 'Proof of 10-Year Stay'],
    requiredFields: ['Years of Continuous Residence', 'Native District', 'Parent Residence Details'],
    processingDays: '10-14 Working Days',
    fee: '₹30',
    eligibility: 'Minimum 10 consecutive years of domicile in the state',
    popular: true,
    active: true,
  },
  {
    serviceId: 'service-learner-dl',
    title: "Learner's Driving License Permit",
    departmentId: 'dept-trans',
    departmentName: 'Transport Department',
    category: 'transport' as const,
    categoryLabel: 'Transport Services',
    description: 'Provisional license permitting citizen to practice driving vehicles with instructor.',
    requiredDocs: ['Identity Document', 'Address Information', 'Age Proof Marksheet'],
    requiredFields: ['Vehicle Category (MCWG/LMV)', 'Blood Group', 'Emergency Contact'],
    processingDays: '3-5 Working Days',
    fee: '₹150',
    eligibility: 'Age 18+ for Light Motor Vehicles (16+ for gearless 50cc)',
    popular: true,
    active: true,
  },
  {
    serviceId: 'service-senior-pension',
    title: 'Senior Citizen Social Pension',
    departmentId: 'dept-welfare',
    departmentName: 'Social Welfare Department',
    category: 'welfare' as const,
    categoryLabel: 'Social Welfare',
    description: 'Monthly direct benefit transfer pension for elderly citizens with limited financial means.',
    requiredDocs: ['Identity Document', 'Age Certificate', 'Bank Passbook / IFSC'],
    requiredFields: ['Bank Account Number', 'IFSC Code', 'Nominee Name'],
    processingDays: '20-30 Working Days',
    fee: '₹0 (Free)',
    eligibility: 'Age 60 years or older with no pension coverage',
    popular: false,
    active: true,
  },
  {
    serviceId: 'service-ration-addition',
    title: 'Ration Card Family Member Inclusion',
    departmentId: 'dept-welfare',
    departmentName: 'Social Welfare Department',
    category: 'schemes' as const,
    categoryLabel: 'Government Schemes',
    description: 'Add new member (newborn child, spouse after marriage) to household food subsidy card.',
    requiredDocs: ['Identity Document', 'Birth Certificate / Marriage Certificate', 'Existing Ration Card'],
    requiredFields: ['Existing Ration Card Number', 'New Member Relationship', 'Aadhaar of Member'],
    processingDays: '12-18 Working Days',
    fee: '₹20',
    eligibility: 'Existing valid ration card holder family',
    popular: false,
    active: true,
  },
];

export const SEED_DOCUMENTS = [
  {
    documentId: 'doc-cbse-12',
    citizenId: 'cit-001',
    name: 'Class XII Senior School Marksheet',
    docType: 'Marksheet',
    issuer: 'Central Board of Secondary Education (CBSE)',
    issueDate: '24 May 2023',
    docNumber: 'CBSE/2023/849201',
    verified: true,
    category: 'education' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-aadhaar',
    citizenId: 'cit-001',
    name: 'Aadhaar Identity Card (e-KYC)',
    docType: 'Identity Document',
    issuer: 'Unique Identification Authority of India (UIDAI)',
    issueDate: '12 Jan 2021',
    docNumber: 'UIDAI-XXXX-4921',
    verified: true,
    category: 'identity' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-elec',
    citizenId: 'cit-001',
    name: 'Electricity Utility Consumer Bill',
    docType: 'Address Information',
    issuer: 'State Electricity Distribution Co.',
    issueDate: '10 Aug 2026',
    docNumber: 'EB-2024-8841',
    verified: true,
    category: 'address' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-income-affidavit',
    citizenId: 'cit-001',
    name: 'Notarized Income Self-Declaration',
    docType: 'Salary / Income Proof',
    issuer: 'Sub-Divisional Magistrate / Notary',
    issueDate: '15 Jul 2026',
    docNumber: 'AFF-REV-99120',
    verified: true,
    category: 'income' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-pan',
    citizenId: 'cit-001',
    name: 'Permanent Account Number (PAN) Card',
    docType: 'Tax Identity',
    issuer: 'Income Tax Department (Govt. of India)',
    issueDate: '05 Mar 2022',
    docNumber: 'ABCDE1234F',
    verified: true,
    category: 'identity' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-cbse-10',
    citizenId: 'cit-001',
    name: 'Class X Secondary School Marksheet',
    docType: 'Marksheet',
    issuer: 'Central Board of Secondary Education (CBSE)',
    issueDate: '15 Jul 2021',
    docNumber: 'CBSE/2021/654321',
    verified: true,
    category: 'education' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-domicile',
    citizenId: 'cit-001',
    name: 'Residence & Domicile Certificate',
    docType: 'Residence Proof',
    issuer: 'Revenue Department (Tehsil Office, Gandhinagar)',
    issueDate: '18 Nov 2022',
    docNumber: 'DOM-GUJ-2022-99881',
    verified: true,
    category: 'address' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-caste',
    citizenId: 'cit-001',
    name: 'Social Category / Caste Certificate',
    docType: 'Community Certificate',
    issuer: 'District Social Welfare Officer',
    issueDate: '22 Feb 2021',
    docNumber: 'SC-ST-OBC-7729',
    verified: true,
    category: 'identity' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
  {
    documentId: 'doc-bank-proof',
    citizenId: 'cit-001',
    name: 'Bank Account Passbook / IFSC Verification',
    docType: 'Bank Account Proof',
    issuer: 'State Bank of India (Public Sector Bank)',
    issueDate: '01 Jan 2025',
    docNumber: 'SBI-ACC-99881122',
    verified: true,
    category: 'income' as const,
    source: 'MOCK_DIGILOCKER',
    verificationStatus: 'VERIFIED_MOCK',
  },
];

export const SEED_APPLICATIONS = [
  {
    applicationId: 'SS-2026-001024',
    serviceId: 'service-scholarship',
    serviceName: 'Post-Matric & Merit Scholarship',
    departmentId: 'dept-edu',
    departmentName: 'Education Department',
    citizenId: 'cit-001',
    citizenName: 'Tanishka',
    status: 'Under Verification',
    submittedAt: '08 Sep 2026, 10:42 AM',
    departmentReferenceId: 'EDU-MOCK-2026-88123',
    consentId: 'perm-edu-001',
    prefilledFields: {
      'Full Name': { value: 'Tanishka', source: 'DigiLocker Mock (UIDAI)', verified: true },
      'Date of Birth': { value: '14/05/2002', source: 'DigiLocker Mock (UIDAI)', verified: true },
      'Permanent Address': { value: 'Flat 402, Sector 14, Gandhinagar, Gujarat - 382016', source: 'DigiLocker Mock (UIDAI)', verified: true },
      'Academic Record': { value: 'CBSE Class XII (89.4%)', source: 'DigiLocker Mock (CBSE)', verified: true },
    },
    userFields: {
      'College Name': 'Gujarat Technological University',
      'Course & Year': 'B.Tech Computer Science, 4th Year',
      'Family Annual Income': '₹3,20,000 / year',
    },
    documentsAttached: [
      {
        docId: 'doc-edu-001',
        name: 'Class XII Senior School Marksheet',
        docType: 'Marksheet',
        source: 'DigiLocker Mock (CBSE)',
        verified: true,
        docNumber: 'CBSE/2023/849201',
        verificationStatus: 'PENDING',
      },
      {
        docId: 'doc-edu-002',
        name: 'Aadhaar Identity Card',
        docType: 'Identity Document',
        source: 'DigiLocker Mock (UIDAI)',
        verified: true,
        docNumber: 'UIDAI-XXXX-4921',
        verificationStatus: 'VERIFIED',
        verifiedBy: 'officer-edu-001',
        verifiedByName: 'Dr. Arvind Sharma',
        verifiedDepartment: 'dept-edu',
        verifiedAt: '08 Sep 2026, 11:15 AM',
      },
    ],
    timeline: [
      {
        id: 't-1',
        title: 'Application Submitted',
        timestamp: '08 Sep 2026, 10:42 AM',
        description: 'Dispatched through SevaSetu Interoperability Layer to State Education Department Adapter.',
        status: 'completed' as const,
      },
      {
        id: 't-2',
        title: 'Documents Received',
        timestamp: '08 Sep 2026, 10:43 AM',
        description: 'Verified digital payloads received from connected DigiLocker Mock Adapter.',
        status: 'completed' as const,
      },
      {
        id: 't-3',
        title: 'Documents Verified',
        timestamp: '08 Sep 2026, 12:20 PM',
        description: 'Automated cryptographic signature check confirmed CBSE and UIDAI documents valid.',
        status: 'completed' as const,
      },
      {
        id: 't-4',
        title: 'Department Review',
        timestamp: 'In Progress',
        description: 'Academic scrutiny committee reviewing family income ceiling and institute affiliation.',
        status: 'current' as const,
      },
      {
        id: 't-5',
        title: 'Approval',
        timestamp: 'Pending',
        description: 'Sanction order generation by District Education Officer.',
        status: 'pending' as const,
      },
      {
        id: 't-6',
        title: 'Completion',
        timestamp: 'Pending',
        description: 'Disbursement of scholarship grant directly via PFMS to citizen bank account.',
        status: 'pending' as const,
      },
    ],
    officerRemarks: [
      {
        id: 'rem-seed-1',
        applicationId: 'SS-2026-001024',
        officerId: 'officer-edu-001',
        officerName: 'Dr. Arvind Sharma',
        departmentId: 'dept-edu',
        role: 'officer',
        text: 'Aadhaar e-KYC and family domicile verified against UIDAI mock ledger. Awaiting academic marksheet manual sign-off.',
        timestamp: '08 Sep 2026, 11:20 AM',
      },
    ],
  },
  {
    applicationId: 'SS-2026-000842',
    serviceId: 'service-income',
    serviceName: 'Income & Asset Certificate',
    departmentId: 'dept-rev',
    departmentName: 'Revenue Department',
    citizenId: 'cit-001',
    citizenName: 'Tanishka',
    status: 'Approved',
    submittedAt: '24 Aug 2026, 02:15 PM',
    departmentReferenceId: 'REV-MOCK-2026-11942',
    consentId: 'perm-rev-001',
    prefilledFields: {
      'Full Name': { value: 'Tanishka', source: 'DigiLocker Mock (UIDAI)', verified: true },
      'Permanent Address': { value: 'Flat 402, Sector 14, Gandhinagar, Gujarat - 382016', source: 'DigiLocker Mock (UIDAI)', verified: true },
    },
    userFields: {
      'Occupation of Parents': 'Private Sector Employment',
      'Total Annual Income': '₹3,20,000',
      'Taluka/Tehsil': 'Gandhinagar Urban',
    },
    documentsAttached: [
      { docId: 'doc-rev-001', name: 'Aadhaar Identity Card', docType: 'Identity Document', source: 'DigiLocker Mock (UIDAI)', verified: true, verificationStatus: 'VERIFIED' },
      { docId: 'doc-rev-002', name: 'Income Self-Declaration', docType: 'Salary / Income Proof', source: 'DigiLocker Mock', verified: true, verificationStatus: 'VERIFIED' },
    ],
    timeline: [
      { id: 't-1', title: 'Application Submitted', timestamp: '24 Aug 2026, 02:15 PM', description: 'Application received by Revenue Taluka adapter.', status: 'completed' as const },
      { id: 't-2', title: 'Documents Verified', timestamp: '25 Aug 2026, 11:00 AM', description: 'Field verification cleared by Talati officer.', status: 'completed' as const },
      { id: 't-3', title: 'Department Review', timestamp: '27 Aug 2026, 03:20 PM', description: 'Approved by Mamlatdar / Executive Magistrate.', status: 'completed' as const },
      { id: 't-4', title: 'Approved & Completed', timestamp: '28 Aug 2026, 04:30 PM', description: 'Digital certificate issued with QR verification code.', status: 'completed' as const },
    ],
    officerRemarks: [
      {
        id: 'rem-seed-2',
        applicationId: 'SS-2026-000842',
        officerId: 'officer-rev-001',
        officerName: 'Smt. Rekha Patel',
        departmentId: 'dept-rev',
        role: 'officer',
        text: 'Income certificate scrutiny completed. Income verified below statutory threshold.',
        timestamp: '27 Aug 2026, 03:15 PM',
      },
    ],
  },
  {
    applicationId: 'SS-2026-000915',
    serviceId: 'service-residence',
    serviceName: 'Residence & Domicile Certificate',
    departmentId: 'dept-rev',
    departmentName: 'Revenue Department',
    citizenId: 'cit-001',
    citizenName: 'Tanishka',
    status: 'Submitted',
    submittedAt: '06 Sep 2026, 09:30 AM',
    departmentReferenceId: 'REV-MOCK-2026-33912',
    consentId: 'perm-rev-002',
    prefilledFields: {
      'Full Name': { value: 'Tanishka', source: 'DigiLocker Mock (UIDAI)', verified: true },
      'Permanent Address': { value: 'Flat 402, Sector 14, Gandhinagar, Gujarat - 382016', source: 'DigiLocker Mock (UIDAI)', verified: true },
    },
    userFields: {
      'Years of Continuous Residence': '14 Years',
      'Native District': 'Gandhinagar',
    },
    documentsAttached: [
      { docId: 'doc-rev-003', name: 'Aadhaar Identity Card', docType: 'Identity Document', source: 'DigiLocker Mock (UIDAI)', verified: true, verificationStatus: 'VERIFIED' },
      { docId: 'doc-rev-004', name: 'Electricity Utility Consumer Bill', docType: 'Address Information', source: 'DigiLocker Mock', verified: false, verificationStatus: 'PENDING' },
    ],
    timeline: [
      { id: 't-1', title: 'Application Submitted', timestamp: '06 Sep 2026, 09:30 AM', description: 'Dispatched to Revenue Department Adapter.', status: 'completed' as const },
      { id: 't-2', title: 'Document Verification', timestamp: 'In Progress', description: 'Address utility billing records being cross-referenced.', status: 'current' as const },
      { id: 't-3', title: 'Tehsildar Review', timestamp: 'Pending', description: 'Local municipal inspection check.', status: 'pending' as const },
      { id: 't-4', title: 'Certificate Issuance', timestamp: 'Pending', description: 'Final sign-off by designated authority.', status: 'pending' as const },
    ],
    officerRemarks: [],
  },
];

export const SEED_CONSENTS = [
  {
    consentId: 'perm-edu-001',
    whoHasAccess: 'Education Department, Govt. of India',
    departmentId: 'dept-edu',
    citizenId: 'cit-001',
    whatData: ['Class 10/12 Marksheet', 'Full Name', 'Date of Birth', 'Permanent Address'],
    whyPurpose: 'Scholarship application verification and eligibility validation',
    whichApplicationId: 'SS-2026-001024',
    whichServiceName: 'Post-Matric & Merit Scholarship',
    fromWhen: '08 September 2026, 10:42 AM',
    untilWhen: '30 September 2026',
    status: 'Active' as const,
  },
  {
    consentId: 'perm-rev-002',
    whoHasAccess: 'Revenue Department (District Magistrate)',
    departmentId: 'dept-rev',
    citizenId: 'cit-001',
    whatData: ['Aadhaar Card (e-KYC)', 'Permanent Address', 'Full Name'],
    whyPurpose: 'Residence certificate address and continuous stay verification',
    whichApplicationId: 'SS-2026-000915',
    whichServiceName: 'Residence & Domicile Certificate',
    fromWhen: '06 September 2026, 09:30 AM',
    untilWhen: '06 October 2026',
    status: 'Active' as const,
  },
  {
    consentId: 'perm-rev-001',
    whoHasAccess: 'Revenue Department (Income Branch)',
    departmentId: 'dept-rev',
    citizenId: 'cit-001',
    whatData: ['Income Self-Declaration', 'Full Name', 'Aadhaar e-KYC'],
    whyPurpose: 'Income certificate scrutiny and annual slab evaluation',
    whichApplicationId: 'SS-2026-000842',
    whichServiceName: 'Income & Asset Certificate',
    fromWhen: '24 August 2026, 02:15 PM',
    untilWhen: '24 September 2026',
    status: 'Active' as const,
  },
];

export const SEED_ACTIVITIES = [
  {
    activityId: 'act-001',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-001024',
    timestamp: '08 Sep 2026, 12:25 PM',
    serviceName: 'Post-Matric & Merit Scholarship',
    departmentName: 'Education Department',
    action: 'Application moved to department review',
    details: 'Academic scrutiny committee initiated eligibility check for SS-2026-001024',
    type: 'status_change' as const,
    statusBadge: 'Under Review',
  },
  {
    activityId: 'act-002',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-001024',
    timestamp: '08 Sep 2026, 12:20 PM',
    serviceName: 'Post-Matric & Merit Scholarship',
    departmentName: 'Education Department',
    action: 'Documents verified via DigiLocker Mock Adapter',
    details: 'Cryptographic validation succeeded for CBSE Class XII Marksheet',
    type: 'verification' as const,
    statusBadge: 'Verified',
  },
  {
    activityId: 'act-003',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-001024',
    timestamp: '08 Sep 2026, 10:42 AM',
    serviceName: 'Post-Matric & Merit Scholarship',
    departmentName: 'Education Department',
    action: 'Consent granted for scholarship verification',
    details: 'Citizen authorized Education Dept to access Marksheet, Name, DoB until 30 Sep 2026',
    type: 'consent_grant' as const,
    statusBadge: 'Consent Granted',
  },
  {
    activityId: 'act-004',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-001024',
    timestamp: '08 Sep 2026, 10:42 AM',
    serviceName: 'Post-Matric & Merit Scholarship',
    departmentName: 'Education Department',
    action: 'Application submitted - SS-2026-001024',
    details: 'Dispatched through SevaSetu Interoperability Layer to Education Department',
    type: 'submission' as const,
    statusBadge: 'Submitted',
  },
  {
    activityId: 'act-005',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-000915',
    timestamp: '06 Sep 2026, 09:30 AM',
    serviceName: 'Residence & Domicile Certificate',
    departmentName: 'Revenue Department',
    action: 'Application submitted - SS-2026-000915',
    details: 'Dispatched with authorized address credentials to Revenue Portal',
    type: 'submission' as const,
    statusBadge: 'Submitted',
  },
  {
    activityId: 'act-006',
    citizenId: 'cit-001',
    applicationId: 'SS-2026-000842',
    timestamp: '28 Aug 2026, 04:30 PM',
    serviceName: 'Income & Asset Certificate',
    departmentName: 'Revenue Department',
    action: 'Income Certificate Approved - SS-2026-000842',
    details: 'Final approval issued by Sub-Divisional Officer. Download available.',
    type: 'status_change' as const,
    statusBadge: 'Approved',
  },
];

export const SEED_DATA_EXCHANGES = [
  {
    exchangeId: 'xchg-001',
    applicationId: 'SS-2026-001024',
    citizenId: 'cit-001',
    documentId: 'doc-cbse-12',
    documentType: 'Marksheet',
    normalizedType: 'EDUCATION_MARKSHEET',
    sourceSystem: 'DigiLocker Mock Adapter (Demo)',
    targetDepartment: 'dept-edu',
    purpose: 'Scholarship eligibility and academic transcript verification',
    consentId: 'perm-edu-001',
    requestedAt: '08 Sep 2026, 10:42 AM',
    accessedAt: '08 Sep 2026, 10:43 AM',
    status: 'FETCHED' as const,
    requestedBy: 'cit-001',
    requestedByName: 'Tanishka',
    metadata: { maskedReference: 'CBSE/2023/XXXXXX' },
  },
  {
    exchangeId: 'xchg-002',
    applicationId: 'SS-2026-001024',
    citizenId: 'cit-001',
    documentId: 'doc-aadhaar',
    documentType: 'Identity Document',
    normalizedType: 'IDENTITY_AADHAAR',
    sourceSystem: 'DigiLocker Mock Adapter (Demo)',
    targetDepartment: 'dept-edu',
    purpose: 'Applicant e-KYC and identity verification',
    consentId: 'perm-edu-001',
    requestedAt: '08 Sep 2026, 10:42 AM',
    accessedAt: '08 Sep 2026, 10:43 AM',
    status: 'FETCHED' as const,
    requestedBy: 'cit-001',
    requestedByName: 'Tanishka',
    metadata: { maskedReference: 'XXXX-XXXX-4921' },
  },
  {
    exchangeId: 'xchg-003',
    applicationId: 'SS-2026-000915',
    citizenId: 'cit-001',
    documentId: 'doc-elec',
    documentType: 'Address Information',
    normalizedType: 'ADDRESS_PROOF_UTILITY',
    sourceSystem: 'DigiLocker Mock Adapter (Demo)',
    targetDepartment: 'dept-rev',
    purpose: 'Continuous residence and address utility check',
    consentId: 'perm-rev-002',
    requestedAt: '06 Sep 2026, 09:30 AM',
    accessedAt: '06 Sep 2026, 09:31 AM',
    status: 'FETCHED' as const,
    requestedBy: 'cit-001',
    requestedByName: 'Tanishka',
    metadata: { maskedReference: 'EB-XXXX-8841' },
  },
];

export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    logger.info('Starting database seeding...');

    // Clear existing collections safely
    await User.deleteMany({});
    await Department.deleteMany({});
    await Service.deleteMany({});
    await CitizenDocument.deleteMany({});
    await Application.deleteMany({});
    await Consent.deleteMany({});
    await Activity.deleteMany({});
    await DataExchange.deleteMany({});

    // Seed Demo Users (Citizen, Officers, Admin)
    const createdUsers = await User.insertMany(SEED_USERS);
    const eduOfficer = createdUsers.find((u) => u.email === 'officer.edu@gov.in');
    const revOfficer = createdUsers.find((u) => u.email === 'officer.rev@gov.in');

    // Seed Departments
    await Department.insertMany(SEED_DEPARTMENTS);

    // Seed Services
    await Service.insertMany(SEED_SERVICES);

    // Seed Documents
    await CitizenDocument.insertMany(SEED_DOCUMENTS);

    // Seed Applications with authentic officer User IDs
    const applicationsToSeed = SEED_APPLICATIONS.map((app) => {
      const clone = JSON.parse(JSON.stringify(app));
      if (clone.applicationId === 'SS-2026-001024' && eduOfficer) {
        if (clone.documentsAttached[1]) {
          clone.documentsAttached[1].verifiedBy = eduOfficer._id.toString();
        }
        if (clone.officerRemarks && clone.officerRemarks[0]) {
          clone.officerRemarks[0].officerId = eduOfficer._id.toString();
        }
      }
      if (clone.applicationId === 'SS-2026-000842' && revOfficer) {
        if (clone.officerRemarks && clone.officerRemarks[0]) {
          clone.officerRemarks[0].officerId = revOfficer._id.toString();
        }
      }
      return clone;
    });

    await Application.insertMany(applicationsToSeed);

    // Seed Consents
    await Consent.insertMany(SEED_CONSENTS);

    // Seed Activities
    await Activity.insertMany(SEED_ACTIVITIES);

    // Seed Data Exchanges
    await DataExchange.insertMany(SEED_DATA_EXCHANGES);

    logger.info('Database seeded successfully with pristine demo dataset.');
    return { success: true, message: 'Database seeded successfully with demo records.' };
  } catch (error: any) {
    logger.error('Failed to seed database:', error);
    throw error;
  }
}

// Standalone execution support
if (require.main === module || (process.argv[1] && process.argv[1].includes('seedData'))) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed execution error:', err);
      process.exit(1);
    });
}
