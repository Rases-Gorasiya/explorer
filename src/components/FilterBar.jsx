import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { zones, types, significances } from '../data/filters';

const sortOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'fee', label: 'Fee' },
  { value: 'time', label: 'Duration' },
  { value: 'name', label: 'Name' },
];

export default function FilterBar({ filters, onFilterChange, sortBy, onSortChange, sortOrder, onSortOrderChange, resultCount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && val !== 'All' && val !== '' && val !== null && val !== undefined && key !== 'search'
  ).length;

  return (
    <div className="mb-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <motion.button
            id="filter-toggle"
            className="glass-button px-4 py-2 text-sm font-medium flex items-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[var(--color-cyber-cyan)] text-[var(--color-deep-space)] text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          <span className="text-sm text-[var(--color-text-muted)]">
            {resultCount} landmark{resultCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Sort by</span>
          <div className="flex items-center gap-1">
            {sortOptions.map((opt) => (
              <motion.button
                key={opt.value}
                id={`sort-${opt.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  sortBy === opt.value
                    ? 'bg-[rgba(0,242,255,0.1)] text-[var(--color-cyber-cyan)] border border-[rgba(0,242,255,0.2)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.03)]'
                }`}
                onClick={() => onSortChange(opt.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {opt.label}
              </motion.button>
            ))}
            <motion.button
              id="sort-order-toggle"
              className="glass-button px-2 py-1.5 text-xs"
              onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="glass p-5 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Zone */}
                <FilterSelect
                  id="filter-zone"
                  label="Zone"
                  value={filters.zone || 'All'}
                  options={['All', ...zones]}
                  onChange={(val) => handleChange('zone', val)}
                />

                {/* Type */}
                <FilterSelect
                  id="filter-type"
                  label="Type"
                  value={filters.type || 'All'}
                  options={['All', ...types]}
                  onChange={(val) => handleChange('type', val)}
                />

                {/* Significance */}
                <FilterSelect
                  id="filter-significance"
                  label="Significance"
                  value={filters.significance || 'All'}
                  options={['All', ...significances]}
                  onChange={(val) => handleChange('significance', val)}
                />

                {/* DSLR */}
                <FilterSelect
                  id="filter-dslr"
                  label="DSLR Allowed"
                  value={filters.dslrAllowed === true ? 'Yes' : filters.dslrAllowed === false ? 'No' : 'All'}
                  options={['All', 'Yes', 'No']}
                  onChange={(val) => handleChange('dslrAllowed', val === 'Yes' ? true : val === 'No' ? false : null)}
                />

                {/* Min Rating */}
                <FilterSelect
                  id="filter-rating"
                  label="Min Rating"
                  value={filters.minRating || 'All'}
                  options={['All', '4.0', '4.2', '4.4', '4.5', '4.6', '4.7', '4.8']}
                  onChange={(val) => handleChange('minRating', val === 'All' ? null : parseFloat(val))}
                />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <motion.button
                  className="mt-4 text-xs text-[var(--color-cyber-cyan)] hover:text-[var(--color-text-primary)] transition-colors"
                  onClick={() => onFilterChange({})}
                  whileHover={{ scale: 1.03 }}
                >
                  ✕ Clear all filters
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      {activeFilterCount > 0 && !isExpanded && (
        <motion.div
          className="flex flex-wrap gap-2 mt-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Object.entries(filters)
            .filter(([key, val]) => val && val !== 'All' && val !== '' && val !== null && key !== 'search')
            .map(([key, val]) => (
              <motion.span
                key={key}
                className="px-3 py-1 rounded-full text-xs bg-[rgba(0,242,255,0.08)] border border-[rgba(0,242,255,0.15)] text-[var(--color-cyber-cyan)] flex items-center gap-1.5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <span className="text-[var(--color-text-muted)] text-[10px]">{key}:</span>
                {String(val)}
                <button
                  onClick={() => handleChange(key, key === 'dslrAllowed' || key === 'minRating' ? null : 'All')}
                  className="ml-0.5 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </motion.span>
            ))}
        </motion.div>
      )}
    </div>
  );
}

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full glass-input px-3 py-2 text-sm rounded-lg appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '16px',
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[var(--color-deep-space)] text-[var(--color-text-primary)]">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
