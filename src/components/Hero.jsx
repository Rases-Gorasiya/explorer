import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { getStats } from '../data/filters';

export default function Hero({ searchQuery, onSearchChange }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const stats = getStats();

  const statItems = [
    { value: stats.totalLandmarks, label: 'Landmarks', icon: '◈' },
    { value: stats.totalStates, label: 'States', icon: '◎' },
    { value: stats.totalZones, label: 'Zones', icon: '⬡' },
    { value: stats.avgRating, label: 'Avg Rating', icon: '★' },
    { value: stats.totalFreeEntries, label: 'Free Entry', icon: '♦' },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  return (
    <section ref={ref} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--color-cyber-cyan), transparent)' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, var(--color-ethereal-gold), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, var(--color-nebula-purple), transparent)' }} />
      </motion.div>

      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute top-32 right-20 w-16 h-16 border border-[rgba(0,242,255,0.15)] rounded-xl rotate-45"
        animate={{ y: [0, -20, 0], rotate: [45, 50, 45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-16 w-12 h-12 border border-[rgba(255,202,40,0.12)] rounded-full"
        animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-48 left-1/4 w-8 h-8 border border-[rgba(168,85,247,0.1)] rounded-lg rotate-12"
        animate={{ y: [0, -12, 0], rotate: [12, 24, 12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{ y: textY, opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span className="inline-block text-xs tracking-[0.3em] uppercase text-[var(--color-cyber-cyan)] font-medium px-4 py-1.5 rounded-full border border-[rgba(0,242,255,0.15)] bg-[rgba(0,242,255,0.05)]">
            Travel Analysis Platform
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-[Outfit] font-bold leading-tight mb-6"
        >
          <span className="text-gradient-cyan">Discover</span>{' '}
          <span className="text-[var(--color-text-primary)]">India's</span>
          <br />
          <span className="text-gradient-gold">Iconic</span>{' '}
          <span className="text-[var(--color-text-primary)]">Landmarks</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Explore 325 breathtaking destinations across India. Analyze ratings, 
          plan optimal routes, and discover hidden gems — all in one place.
        </motion.p>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="relative max-w-xl mx-auto mb-12">
          <div className="glass-strong flex items-center px-5 py-3 rounded-2xl shadow-[var(--shadow-float)]">
            <svg className="w-5 h-5 text-[var(--color-cyber-cyan)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="hero-search"
              type="text"
              placeholder="Search landmarks, cities, states..."
              className="w-full bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none text-base"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          className="flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {statItems.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center"
              whileHover={{ scale: 1.08, y: -3 }}
            >
              <div className="text-2xl md:text-3xl font-[Outfit] font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5">
                <span className="text-sm text-[var(--color-cyber-cyan)]">{stat.icon}</span>
                {stat.value}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[rgba(0,242,255,0.2)] flex justify-center pt-2">
          <div className="w-1 h-2.5 rounded-full bg-[var(--color-cyber-cyan)] opacity-60" />
        </div>
      </motion.div>
    </section>
  );
}
