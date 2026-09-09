import React, { useState } from 'react';
import {
  ServiceItem,
  Citizen,
  DigiLockerMockDocument,
  Application,
} from '../types';
import { adapterStore } from '../services/adapterStore';
import {
  X,
  Shield,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Building2,
  Send,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationFlowModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  citizen: Citizen;
  digiLockerDocs: DigiLockerMockDocument[];
  onApplicationSubmitted: (newApp: Application) => void;
  onTrackApplication: (appId: string) => void;
}

export const ApplicationFlowModal: React.FC<ApplicationFlowModalProps> = ({
  service,
  isOpen,
  onClose,
  citizen,
  digiLockerDocs,
  onApplicationSubmitted,
  onTrackApplication,
}) => {
  if (!isOpen || !service) return null;

  // Step state: 1: requirements, 2: consent, 3: prefilled-form, 4: review, 5: submitted
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdApplication, setCreatedApplication] = useState<Application | null>(null);

  // Editable Form fields
  const [fullName, setFullName] = useState(citizen.name);
  const [dob, setDob] = useState(citizen.dateOfBirth);
  const [address, setAddress] = useState(citizen.address);
  const [userFieldValues, setUserFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (service.id === 'service-scholarship') {
      initial['College Name'] = 'Gujarat Technological University (GTU)';
      initial['Course & Year'] = 'B.Tech Computer Science, 4th Year';
      initial['Family Annual Income'] = '₹3,20,000 / year';
    } else if (service.id === 'service-income') {
      initial['Occupation of Parents'] = 'Private Enterprise Service';
      initial['Total Annual Income (INR)'] = '₹3,20,000';
      initial['Taluka/Tehsil'] = 'Gandhinagar Urban';
    } else if (service.id === 'service-residence') {
      initial['Years of Continuous Residence'] = '14 Years';
      initial['Native District'] = 'Gandhinagar';
      initial['Parent Residence Details'] = 'Residing at present address since 2012';
    } else if (service.id === 'service-learner-dl') {
      initial['Vehicle Category (MCWG/LMV)'] = 'Light Motor Vehicle (LMV) + Two Wheeler';
      initial['Blood Group'] = 'O Positive (O+)';
      initial['Emergency Contact'] = '+91 98765 00112';
    } else {
      service.requiredFields.forEach((field) => {
        initial[field] = '';
      });
    }
    return initial;
  });

  const handleFieldChange = (field: string, val: string) => {
    setUserFieldValues((prev) => ({ ...prev, [field]: val }));
  };

  // Pre-filled fields configuration
  const prefilledData: Record<string, { value: string; source: string; verified: boolean }> = {
    'Full Name': { value: fullName, source: 'DigiLocker Mock (UIDAI)', verified: true },
    'Date of Birth': { value: dob, source: 'DigiLocker Mock (UIDAI)', verified: true },
    'Permanent Address': { value: address, source: 'DigiLocker Mock (UIDAI)', verified: true },
    'Academic Record': {
      value: 'Class XII CBSE Marksheet (Roll: CBSE/2023/849201)',
      source: 'DigiLocker Mock (CBSE)',
      verified: true,
    },
  };

  const attachedDocs = [
    {
      name: 'Class XII Senior School Marksheet',
      docType: 'Marksheet',
      source: 'DigiLocker Mock (CBSE)',
      verified: true,
      docNumber: 'CBSE/2023/849201',
    },
    {
      name: 'Aadhaar Identity Card (e-KYC)',
      docType: 'Identity Document',
      source: 'DigiLocker Mock (UIDAI)',
      verified: true,
      docNumber: citizen.maskedAadhaar,
    },
    {
      name: 'Electricity Utility Consumer Bill',
      docType: 'Address Information',
      source: 'DigiLocker Mock Adapter',
      verified: true,
      docNumber: 'EB-2024-8841',
    },
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newApp = adapterStore.submitApplication({
        service,
        prefilledFields: prefilledData,
        userFields: userFieldValues,
        attachedDocs,
      });

      setCreatedApplication(newApp);
      setIsSubmitting(false);
      setStep(5);
      onApplicationSubmitted(newApp);

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 600);
  };

  const resetAndClose = () => {
    setStep(1);
    setCreatedApplication(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-navy-900 dark:bg-[#0B1120] text-white p-5 flex items-center justify-between border-b border-navy-800 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 text-brand-300 rounded-lg border border-brand-400/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Adapter Integration Flow
                </span>
                <span className="text-xs text-slate-300">{service.departmentName}</span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">{service.title}</h3>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        <div className="bg-slate-50 dark:bg-[#162033] border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Requirements' },
            { num: 2, label: 'Consent' },
            { num: 3, label: 'Pre-filled Form' },
            { num: 4, label: 'Review' },
            { num: 5, label: 'Submission' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.num
                    ? 'bg-brand-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span
                className={`hidden sm:inline font-medium ${
                  step === s.num ? 'text-brand-900 dark:text-brand-300 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: REQUIREMENTS & DOCUMENT AVAILABILITY */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                1. Information &amp; Documents Required
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                SevaSetu has checked your connected simulated/mock DigiLocker connector. Verified credentials found will be
                auto-filled once you give service consent.
              </p>
            </div>

            {/* Document Check list */}
            <div className="space-y-2.5">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Citizen Full Name</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">From Aadhaar e-KYC (UIDAI)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                  Available (Verified)
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Date of Birth</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified from Aadhaar Record</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                  Available (Verified)
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Permanent Address</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cross-verified with Electricity Consumer Record</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                  Available (Verified)
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Academic Marksheet</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">CBSE Class XII Digital Marksheet (2023)</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
                  Available (Verified)
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Manual Uploads:</strong> Because these documents are verified from the DigiLocker Mock
                Adapter, you do not need to scan or upload physical PDF certificates.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetAndClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <span>Proceed to Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GRANULAR SERVICE-SPECIFIC CONSENT */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Service-Specific Consent Request</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {service.departmentName} is requesting access to:
              </h4>
            </div>

            {/* Requested fields checklist */}
            <div className="p-4 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Requested Verified Data Fields:</span>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full Legal Name</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Date of Birth</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Permanent Address</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Class 10/12 Marksheet</span>
                </div>
              </div>
            </div>

            {/* Purpose & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-900 dark:text-white block">Purpose:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {service.title} application verification and eligibility check.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="font-bold text-slate-900 dark:text-white block">Access Duration:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-semibold text-navy-900 dark:text-slate-100">
                  Valid until 30 September 2026
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>Revocability Guarantee:</strong> You retain complete ownership. You can inspect this active
                permission and revoke it anytime from the <strong>Data &amp; Consent</strong> dashboard.
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={resetAndClose}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Allow Access &amp; Pre-fill Form</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PRE-FILLED APPLICATION FORM (EDITABLE & REVIEWABLE) */}
        {step === 3 && (
          <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold rounded-full">
                  Pre-filled via Mock Adapter
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                Application Form &bull; {service.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Information retrieved from your connected document source has been pre-filled below. You may review
                and edit fields before submitting.
              </p>
            </div>

            {/* Pre-filled fields section */}
            <div className="p-4 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3.5">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Identity Data (Pre-Filled)</span>
              </h5>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                    Pre-filled from DigiLocker (UIDAI)
                  </span>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* DOB */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                    Pre-filled from DigiLocker (UIDAI)
                  </span>
                </div>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Permanent Address</label>
                  <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                    Pre-filled from DigiLocker (UIDAI)
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Marksheet document badge */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Academic Record Document</label>
                  <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded">
                    Retrieved from connected document source
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Class XII CBSE Marksheet (2023)</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Doc Ref: CBSE/2023/849201 &bull; Verified</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Attached</span>
                </div>
              </div>
            </div>

            {/* Department Specific Required Fields */}
            <div className="p-4 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                Department Specific Information
              </h5>

              {service.requiredFields.map((field) => (
                <div key={field}>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">{field}</label>
                  <input
                    type="text"
                    value={userFieldValues[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={`Enter ${field}`}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <span>Review Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW APPLICATION */}
        {step === 4 && (
          <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                4. Review Application Summary
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verify all information before final dispatch to {service.departmentName} via SevaSetu Adapter.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 dark:bg-[#162033] px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                Applicant &amp; Verified Identity
              </div>
              <div className="p-4 space-y-2 bg-white dark:bg-[#111827] divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Applicant Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Date of Birth:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{dob}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Address:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">{address}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Aadhaar (UIDAI):</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{citizen.maskedAadhaar}</span>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-[#162033] px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 border-t border-b border-slate-200 dark:border-slate-800">
                Service Details
              </div>
              <div className="p-4 space-y-2 bg-white dark:bg-[#111827] divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(userFieldValues).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">{key}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Target Department:</span>
                  <span className="font-semibold text-navy-900 dark:text-brand-300">{service.departmentName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Standard Processing Window:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{service.processingDays}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[11px] text-amber-900 dark:text-amber-300">
              <strong>Declaration:</strong> By clicking &quot;Submit Application&quot;, I authorize SevaSetu to route
              the pre-filled verified credentials and application payload to {service.departmentName}&apos;s system.
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-colors disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>Dispatching via Adapter...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUBMISSION SUCCESS & APPLICATION ID */}
        {step === 5 && createdApplication && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-full mb-1">
                ✓ Application Submitted Successfully
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{service.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Your application has been received and dispatched to {service.departmentName} via the SevaSetu
                Interoperability Layer (Mock Adapter Dispatch).
              </p>
            </div>

            {/* Application ID Card */}
            <div className="p-4 bg-slate-50 dark:bg-[#162033] border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Application ID:</span>
                <span className="font-mono font-bold text-brand-700 dark:text-brand-300 text-sm bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800/50">
                  {createdApplication.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{createdApplication.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Initial Status:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">Submitted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Submission Timestamp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{createdApplication.submittedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Consent Duration:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Active until 30 Sep 2026</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl text-left text-xs text-blue-900 dark:text-blue-300">
              <strong>Interoperability Confirmation:</strong> A cryptographic receipt of this submission has been logged
              in your <strong>Activity</strong> tab, and data access permissions have been recorded under{' '}
              <strong>Data &amp; Consent</strong>.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetAndClose}
                className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  const appId = createdApplication.id;
                  resetAndClose();
                  onTrackApplication(appId);
                }}
                className="flex-1 py-2.5 bg-navy-900 dark:bg-brand-600 hover:bg-navy-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Track Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
