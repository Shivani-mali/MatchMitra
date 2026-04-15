const FilterBar = ({ filters, setFilters, sortBy, setSortBy }) => {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
        <input
          placeholder="Min age"
          value={filters.minAge}
          onChange={(event) => update('minAge', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Max age"
          value={filters.maxAge}
          onChange={(event) => update('maxAge', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(event) => update('location', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Profession"
          value={filters.profession}
          onChange={(event) => update('profession', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Education"
          value={filters.education}
          onChange={(event) => update('education', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Religion (optional)"
          value={filters.religion}
          onChange={(event) => update('religion', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          placeholder="Language"
          value={filters.language}
          onChange={(event) => update('language', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Height (cm)"
          value={filters.height}
          onChange={(event) => update('height', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={filters.maritalStatus}
          onChange={(event) => update('maritalStatus', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Marital Status</option>
          <option value="single">Single</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
        <input
          placeholder="Interests (comma separated)"
          value={filters.interests}
          onChange={(event) => update('interests', event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="compatibility">Compatibility</option>
          <option value="newest">Newest</option>
          <option value="distance">Distance</option>
          <option value="completeness">Profile Completeness</option>
          <option value="active">Recently Active</option>
        </select>
      </div>
    </section>
  );
};

export default FilterBar;
