export default function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  selectedFilters = {},
  onFilterChange,
  categories = [],
  selectedCategory = 'All',
  onCategorySelect,
  onReset,
  className = '',
}) {
  const hasActiveFilters =
    Boolean(searchValue) ||
    (categories.length > 0 && selectedCategory !== 'All') ||
    Object.values(selectedFilters).some((val) => val && val !== 'all' && val !== 'All');

  return (
    <div className={`reusable-filter-bar ${className}`}>
      {/* Category Chips Bar (if provided) */}
      {categories.length > 0 && (
        <div className="category-chips-row" style={{ marginBottom: '12px' }}>
          {categories.map((cat) => {
            const catLabel = typeof cat === 'string' ? cat : cat.label;
            const catValue = typeof cat === 'string' ? cat : cat.value;
            const isActive = selectedCategory === catValue;

            return (
              <button
                type="button"
                key={catValue}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => onCategorySelect && onCategorySelect(catValue)}
              >
                {catLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Search & Select Filters Row */}
      <div className="announcements-filter-bar">
        {onSearchChange && (
          <div className="announcements-search-box" style={{ minWidth: '240px', flex: 1 }}>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {filters.map((f) => (
          <div key={f.key} className="filter-select-wrapper">
            {f.label && <span className="filter-select-label">{f.label}:</span>}
            <select
              value={selectedFilters[f.key] || 'all'}
              onChange={(e) => onFilterChange && onFilterChange(f.key, e.target.value)}
              className="filter-select-input"
            >
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button type="button" className="admin-btn-secondary filter-reset-btn" onClick={onReset}>
            ✕ Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
