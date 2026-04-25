import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import landmarks from '../data/landmarks.json';
import { zoneColors } from '../data/filters';

export default function OptimizerPage() {
  const [budget, setBudget] = useState(2000);
  const [timeLimit, setTimeLimit] = useState(24);
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Filter landmarks for selection
  const availableLandmarks = useMemo(() => {
    let data = landmarks;
    if (selectedZone !== 'All') data = data.filter((l) => l.zone === selectedZone);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q)
      );
    }
    return data;
  }, [selectedZone, searchTerm]);

  // Optimize route
  const optimizedRoute = useMemo(() => {
    if (selectedLandmarks.length === 0) return null;

    // Greedy optimizer: maximize rating while staying within time and fee budgets
    const selected = selectedLandmarks
      .map((id) => landmarks.find((l) => l.id === id))
      .filter(Boolean);

    // Sort by value score: rating / (time + fee/1000)
    const scored = selected.map((l) => ({
      ...l,
      valueScore: l.googleRating / (l.timeNeeded + l.entranceFee / 500 + 0.1),
    }));

    // Greedy selection within budget
    scored.sort((a, b) => b.valueScore - a.valueScore);
    let totalTime = 0;
    let totalFee = 0;
    const route = [];

    for (const landmark of scored) {
      if (totalTime + landmark.timeNeeded <= timeLimit && totalFee + landmark.entranceFee <= budget) {
        route.push(landmark);
        totalTime += landmark.timeNeeded;
        totalFee += landmark.entranceFee;
      }
    }

    // Simple nearest-neighbor ordering by zone proximity
    const zoneOrder = { North: 0, Central: 1, West: 2, South: 3, East: 4 };
    route.sort((a, b) => (zoneOrder[a.zone] || 0) - (zoneOrder[b.zone] || 0));

    const avgRating = route.length > 0
      ? (route.reduce((s, l) => s + l.googleRating, 0) / route.length).toFixed(1)
      : 0;

    return {
      landmarks: route,
      totalTime,
      totalFee,
      avgRating,
      excluded: scored.filter((s) => !route.includes(s)),
    };
  }, [selectedLandmarks, budget, timeLimit]);

  const toggleLandmark = (id) => {
    setSelectedLandmarks((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-4 sm:px-6 py-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-[Outfit] font-bold mb-3">
          <span className="text-gradient-gold">Travel</span>{' '}
          <span className="text-[var(--color-text-primary)]">Optimizer</span>
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-2xl">
          Select landmarks, set your budget and time, and we'll calculate the optimal
          route to maximize your experience while minimizing costs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass p-6 sticky top-24">
            <h3 className="text-lg font-[Outfit] font-semibold mb-5 text-gradient-cyan">Parameters</h3>

            {/* Budget slider */}
            <div className="mb-6">
              <label className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-text-secondary)]">Budget</span>
                <span className="text-[var(--color-ethereal-gold)] font-bold">₹{budget}</span>
              </label>
              <input
                id="budget-slider"
                type="range"
                min="0"
                max="10000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-ethereal-gold) 0%, var(--color-ethereal-gold) ${
                    (budget / 10000) * 100
                  }%, rgba(255,255,255,0.1) ${(budget / 10000) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>

            {/* Time slider */}
            <div className="mb-6">
              <label className="flex justify-between text-sm mb-2">
                <span className="text-[var(--color-text-secondary)]">Time Available</span>
                <span className="text-[var(--color-cyber-cyan)] font-bold">{timeLimit}h</span>
              </label>
              <input
                id="time-slider"
                type="range"
                min="1"
                max="72"
                step="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-cyber-cyan) 0%, var(--color-cyber-cyan) ${
                    (timeLimit / 72) * 100
                  }%, rgba(255,255,255,0.1) ${(timeLimit / 72) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>

            {/* Zone filter */}
            <div className="mb-6">
              <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">Zone</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'North', 'South', 'East', 'West', 'Central'].map((z) => {
                  const zc = zoneColors[z];
                  const isActive = selectedZone === z;
                  return (
                    <motion.button
                      key={z}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'border'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-[rgba(255,255,255,0.03)]'
                      }`}
                      style={
                        isActive
                          ? {
                              background: z === 'All' ? 'rgba(0,242,255,0.1)' : `rgba(${zc?.rgb}, 0.15)`,
                              borderColor: z === 'All' ? 'rgba(0,242,255,0.2)' : `rgba(${zc?.rgb}, 0.3)`,
                              color: z === 'All' ? 'var(--color-cyber-cyan)' : zc?.color,
                            }
                          : {}
                      }
                      onClick={() => setSelectedZone(z)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {z}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Search Landmarks */}
            <div className="mb-5">
              <label className="text-sm text-[var(--color-text-secondary)] mb-2 block">
                Add Landmarks ({selectedLandmarks.length} selected)
              </label>
              <input
                id="optimizer-search"
                type="text"
                placeholder="Search to add..."
                className="glass-input w-full px-3 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Landmark selection list */}
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 mb-5">
              {availableLandmarks.slice(0, 50).map((l) => {
                const isSelected = selectedLandmarks.includes(l.id);
                const zc = zoneColors[l.zone];
                return (
                  <motion.button
                    key={l.id}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[rgba(0,242,255,0.08)] border border-[rgba(0,242,255,0.15)]'
                        : 'hover:bg-[rgba(255,255,255,0.03)]'
                    }`}
                    onClick={() => toggleLandmark(l.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${
                          isSelected
                            ? 'bg-[var(--color-cyber-cyan)] border-[var(--color-cyber-cyan)] text-[var(--color-deep-space)]'
                            : 'border-[var(--color-glass-border)]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </span>
                      <span className="text-[var(--color-text-primary)] truncate">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[var(--color-text-muted)]">★{l.googleRating}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: zc?.color || '#00f2ff' }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Optimize Button */}
            <motion.button
              id="optimize-button"
              className="w-full py-3 rounded-xl text-sm font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, var(--color-cyber-cyan), #0099ff)',
                color: 'var(--color-deep-space)',
                boxShadow: 'var(--shadow-glow-cyan)',
              }}
              onClick={() => setShowResults(true)}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 242, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              disabled={selectedLandmarks.length === 0}
            >
              {selectedLandmarks.length === 0
                ? 'Select landmarks to optimize'
                : `Optimize ${selectedLandmarks.length} Landmarks`}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {showResults && optimizedRoute ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <SummaryCard
                    icon="◈"
                    label="Landmarks"
                    value={optimizedRoute.landmarks.length}
                    color="var(--color-cyber-cyan)"
                  />
                  <SummaryCard
                    icon="⏱"
                    label="Total Time"
                    value={`${optimizedRoute.totalTime}h`}
                    color="var(--color-nebula-purple)"
                  />
                  <SummaryCard
                    icon="₹"
                    label="Total Cost"
                    value={`₹${optimizedRoute.totalFee}`}
                    color="var(--color-ethereal-gold)"
                  />
                  <SummaryCard
                    icon="★"
                    label="Avg Rating"
                    value={optimizedRoute.avgRating}
                    color="var(--color-success)"
                  />
                </div>

                {/* Route Timeline */}
                <h3 className="text-xl font-[Outfit] font-bold mb-5 text-gradient-cyan">
                  Optimized Itinerary
                </h3>

                <div className="space-y-3">
                  {optimizedRoute.landmarks.map((l, i) => {
                    const zc = zoneColors[l.zone];
                    return (
                      <motion.div
                        key={l.id}
                        className="glass p-4 flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        {/* Step number */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{
                            background: `rgba(${zc?.rgb || '0,242,255'}, 0.15)`,
                            color: zc?.color || 'var(--color-cyber-cyan)',
                            border: `1px solid rgba(${zc?.rgb || '0,242,255'}, 0.25)`,
                          }}
                        >
                          {i + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {l.name}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {l.city}, {l.state}
                          </p>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] flex-shrink-0">
                          <span>⏱ {l.timeNeeded}h</span>
                          <span className="text-[var(--color-ethereal-gold)]">
                            ₹{l.entranceFee === 0 ? 'Free' : l.entranceFee}
                          </span>
                          <span>★ {l.googleRating}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Excluded */}
                {optimizedRoute.excluded.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-[Outfit] font-semibold text-[var(--color-text-muted)] mb-3">
                      ⚠ Didn't fit in budget/time ({optimizedRoute.excluded.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedRoute.excluded.map((l) => (
                        <span
                          key={l.id}
                          className="px-3 py-1 rounded-lg text-xs bg-[rgba(255,255,255,0.03)] text-[var(--color-text-muted)] border border-[rgba(255,255,255,0.05)]"
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="glass p-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🗺️
                </motion.div>
                <h3 className="text-xl font-[Outfit] font-semibold text-[var(--color-text-primary)] mb-3">
                  Plan Your Perfect Trip
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                  Select landmarks from the panel, adjust your budget and time constraints,
                  then click Optimize to get the best itinerary.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <motion.div
      className="glass p-4 text-center"
      whileHover={{ scale: 1.05, y: -3 }}
    >
      <div className="text-xl mb-1" style={{ color }}>
        {icon}
      </div>
      <div className="text-xl font-[Outfit] font-bold text-[var(--color-text-primary)]">
        {value}
      </div>
      <div className="text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}
