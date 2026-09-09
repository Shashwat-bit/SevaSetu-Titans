import React, { useState } from 'react';
import { ServiceItem } from '../types';
import {
  Search,
  Building2,
  Clock,
  FileCheck,
  Tag,
  ArrowRight,
  Sparkles,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ServicesPageProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, onSelectService }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'scholarships', label: 'Scholarships' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'residence', label: 'Residence' },
    { id: 'schemes', label: 'Schemes' },
    { id: 'transport', label: 'Transport' },
    { id: 'welfare', label: 'Social Welfare' },
  ];

  const departments = [
    { id: 'all', label: 'All Departments' },
    { id: 'dept-edu', label: 'Education Dept' },
    { id: 'dept-rev', label: 'Revenue Dept' },
    { id: 'dept-trans', label: 'Transport Dept' },
    { id: 'dept-welfare', label: 'Social Welfare Dept' },
  ];

  const filteredServices = services.filter((service) => {
    const matchesQuery =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.requiredDocs.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesDept = selectedDept === 'all' || service.departmentId === selectedDept;

    return matchesQuery && matchesCategory && matchesDept;
  });

  const popularServices = services.filter((s) => s.popular);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Interoperability Marketplace &bull; Demo Catalog</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            Discover Government Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Apply across state and central departments from a single interoperable portal. Verified credentials
            from your connected document source automatically pre-fill with your explicit consent.
          </p>

          {/* Search Bar */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service name, department, or required document (e.g., Marksheet, Income)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#162033] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#162033] transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-navy-900 dark:bg-slate-800 text-white shadow-sm dark:border dark:border-slate-700'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Departments */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Building2 className="w-3 h-3" />
            Department:
          </span>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Services Quick Strip */}
      {selectedCategory === 'all' && selectedDept === 'all' && !searchQuery && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Services Frequently Accessed</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularServices.map((svc) => (
              <div
                key={`pop-${svc.id}`}
                onClick={() => onSelectService(svc)}
                className="p-3.5 bg-gradient-to-br from-white to-slate-50 dark:from-[#111827] dark:to-[#162033] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-300 dark:hover:border-brand-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-brand-700 dark:text-brand-400 uppercase">{svc.departmentName}</span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{svc.title}</h3>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                  <span>Fast-Track Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
            Available Services ({filteredServices.length})
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Adapter-ready unified endpoints
          </span>
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                {/* Top info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      <Building2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {service.departmentName}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      {service.fee}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 dark:text-white leading-snug">{service.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>

                  {/* Required Documents Tags */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Documents Required (DigiLocker Mock):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {service.requiredDocs.map((doc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Estimated time */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Est. processing: <strong>{service.processingDays}</strong></span>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Auto-fill:</span> Supported
                  </div>
                  <button
                    onClick={() => onSelectService(service)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No services match your filters.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting the category or department filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDept('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-navy-900 dark:bg-slate-800 hover:bg-navy-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
