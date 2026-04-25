import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import StarField from './StarField';

export default function Layout({ children }) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Explore', icon: '◈' },
    { to: '/dashboard', label: 'Dashboard', icon: '◉' },
    { to: '/optimizer', label: 'Optimizer', icon: '⬡' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarField />

      {/* Navigation */}
      <motion.nav
        className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-3"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #00f2ff, #0099ff)',
                boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)',
              }}
              whileHover={{ scale: 1.1, rotate: 12 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              ✦
            </motion.div>
            <div>
              <h1 className="text-lg font-bold font-[Outfit] tracking-wide text-gradient-cyan">
                Explorer
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)] -mt-1 tracking-widest uppercase">
                India · 325 Landmarks
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <motion.div
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-[rgba(0,242,255,0.1)] text-[var(--color-cyber-cyan)] border border-[rgba(0,242,255,0.2)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-xs">{link.icon}</span>
                    {link.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--color-glass-border)] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Explorer — Travel Analysis Platform · 325 Indian Landmarks
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Data derived from the Top Indian Places to Visit dataset
          </p>
        </div>
      </footer>
    </div>
  );
}
