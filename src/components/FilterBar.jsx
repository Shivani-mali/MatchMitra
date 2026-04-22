const FilterBar = ({ filters, setFilters, sortBy, setSortBy }) => {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const InputField = ({ label, placeholder, value, onChange, type = "text", icon }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-slate-200 ${icon ? 'pl-9' : 'px-4'} py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none hover:border-slate-300`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, icon }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl border border-slate-200 ${icon ? 'pl-9' : 'px-4'} py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none hover:border-slate-300 bg-white`}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* Basic Requirements Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div className="col-span-full -mb-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100"></div>
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
            Core Criteria
          </h3>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Min Age"
            placeholder="18"
            value={filters.minAge}
            onChange={(e) => update('minAge', e.target.value)}
            type="number"
          />
          <InputField
            label="Max Age"
            placeholder="99"
            value={filters.maxAge}
            onChange={(e) => update('maxAge', e.target.value)}
            type="number"
          />
        </div>

        <InputField
          label="Location"
          placeholder="City / State"
          value={filters.location}
          onChange={(e) => update('location', e.target.value)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 21s-7-7.5-7-10.8a7 7 0 1 1 14 0c0 3.3-7 10.8-7 10.8z" /><circle cx="12" cy="10" r="3" /></svg>}
        />

        <InputField
          label="Profession"
          placeholder="e.g. Doctor"
          value={filters.profession}
          onChange={(e) => update('profession', e.target.value)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
        />

        <InputField
          label="Religion / Caste"
          placeholder="e.g. Hindu"
          value={filters.religionOrCaste}
          onChange={(e) => update('religionOrCaste', e.target.value)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 2L1 21h22L12 2z" /><path d="M12 7l4.5 9H7.5L12 7z" /></svg>}
        />

        <SelectField
          label="Looking For"
          value={filters.gender}
          onChange={(e) => update('gender', e.target.value)}
          options={[
            { label: 'Any Gender', value: '' },
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ]}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>}
        />
      </div>

      {/* Additional Details Grid */}
      <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div className="col-span-full -mb-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100"></div>
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Extended Filters
          </h3>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        <SelectField
          label="Marital Status"
          value={filters.maritalStatus}
          onChange={(e) => update('maritalStatus', e.target.value)}
          options={[
            { label: 'Any Status', value: '' },
            { label: 'Single', value: 'single' },
            { label: 'Divorced', value: 'divorced' },
            { label: 'Widowed', value: 'widowed' },
            { label: 'Awaiting Divorce', value: 'awaiting_divorce' },
          ]}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
        />

        <InputField
          label="Language"
          placeholder="e.g. Marathi"
          value={filters.language}
          onChange={(e) => update('language', e.target.value)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
        />

        <InputField
          label="Education"
          placeholder="e.g. Bachelor"
          value={filters.education}
          onChange={(e) => update('education', e.target.value)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>}
        />

        <InputField
          label="Min Height (cm)"
          placeholder="150"
          value={filters.minHeight}
          onChange={(e) => update('minHeight', e.target.value)}
          type="number"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M21 10h-8m8 4h-8M3 6l3 3 3-3M6 9v12" /></svg>}
        />

        <div className="flex items-end pb-0.5 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <button
            type="button"
            onClick={() => setFilters({ minAge: '', maxAge: '', location: '', profession: '', religionOrCaste: '', gender: '', maritalStatus: '', language: '', education: '', minHeight: '' })}
            className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 hover:shadow-md active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
