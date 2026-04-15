const FilterBar = ({ filters, setFilters }) => {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
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
        placeholder="Religion/Caste (optional)"
        value={filters.religionOrCaste}
        onChange={(event) => update('religionOrCaste', event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </section>
  );
};

export default FilterBar;
