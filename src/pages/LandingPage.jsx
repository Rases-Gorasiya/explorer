import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import LandmarkCard from '../components/LandmarkCard';
import FilterBar from '../components/FilterBar';
import landmarks from '../data/landmarks.json';
import { filterLandmarks, sortLandmarks, searchLandmarks } from '../data/filters';

const PAGE_SIZE = 24;

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredData = useMemo(() => {
    let data = landmarks;
    if (searchQuery) {
      data = searchLandmarks(data, searchQuery);
    }
    data = filterLandmarks(data, filters);
    data = sortLandmarks(data, sortBy, sortOrder);
    return data;
  }, [searchQuery, filters, sortBy, sortOrder]);

  const visibleData = filteredData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredData.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Explorer Grid Section */}
      <section id="explorer-grid" className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-[Outfit] font-bold mb-2">
            <span className="text-gradient-cyan">Floating</span>{' '}
            <span className="text-[var(--color-text-primary)]">Explorer Grid</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            Hover over any card for an immersive 3D effect · Click to explore
          </p>
        </motion.div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          resultCount={filteredData.length}
        />

        {/* Grid */}
        {filteredData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleData.map((landmark, index) => (
                <LandmarkCard key={landmark.id} landmark={landmark} index={index % PAGE_SIZE} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button
                  id="load-more"
                  className="glass-button px-8 py-3 text-sm font-medium flex items-center gap-2"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show More
                  <span className="text-[var(--color-text-muted)]">
                    ({filteredData.length - visibleCount} remaining)
                  </span>
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            className="glass p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-lg font-[Outfit] font-semibold text-[var(--color-text-primary)] mb-2">
              No landmarks found
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </section>
      {/* Scroll indicator & Back to top */}
      <ScrollToTop />
    </motion.div>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useState(() => {
    const handle = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <motion.button
      className="fixed bottom-8 right-8 w-12 h-12 glass rounded-full flex items-center justify-center z-50 text-[var(--color-cyber-cyan)]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0 }}
      whileHover={{ scale: 1.1, boxShadow: 'var(--shadow-glow-cyan)' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </motion.button>
  );
}
