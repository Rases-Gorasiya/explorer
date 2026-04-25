import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, ZAxis,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
} from 'recharts';
import landmarks from '../data/landmarks.json';
import { zoneColors } from '../data/filters';

// Color palette
const COLORS = {
  cyan: '#00f2ff',
  gold: '#ffca28',
  purple: '#a855f7',
  pink: '#ec4899',
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f59e0b',
  red: '#ef4444',
  teal: '#14b8a6',
  indigo: '#6366f1',
  lime: '#84cc16',
  rose: '#f43f5e',
};

const ZONE_COLORS_ARRAY = [
  { zone: 'North', color: '#3b82f6' },
  { zone: 'South', color: '#22c55e' },
  { zone: 'East', color: '#f59e0b' },
  { zone: 'West', color: '#ec4899' },
  { zone: 'Central', color: '#a855f7' },
];

const TYPE_COLORS = [
  COLORS.cyan, COLORS.gold, COLORS.purple, COLORS.pink, COLORS.green,
  COLORS.blue, COLORS.orange, COLORS.teal, COLORS.indigo, COLORS.lime,
  COLORS.red, COLORS.rose, '#38bdf8', '#fb923c', '#4ade80', '#c084fc',
  '#f472b6', '#fbbf24', '#34d399', '#818cf8', '#a3e635',
];

const SIGNIFICANCE_COLORS = {
  Historical: '#3b82f6',
  Religious: '#a855f7',
  Natural: '#22c55e',
  Cultural: '#f59e0b',
};

// Custom tooltip
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong px-4 py-3 rounded-xl text-xs shadow-lg" style={{ border: '1px solid rgba(0,242,255,0.2)' }}>
      {label && <p className="text-[var(--color-text-primary)] font-semibold mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: entry.color || entry.fill || COLORS.cyan }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color || entry.fill || COLORS.cyan }} />
          {entry.name}: <span className="font-bold text-[var(--color-text-primary)]">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [activeZone, setActiveZone] = useState('All');

  const filtered = useMemo(() => {
    return activeZone === 'All' ? landmarks : landmarks.filter(l => l.zone === activeZone);
  }, [activeZone]);

  // ── Data computations ──

  // 1. Zone distribution
  const zoneData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.zone] = (counts[l.zone] || 0) + 1; });
    return Object.entries(counts).map(([zone, count]) => ({
      name: zone, value: count, color: zoneColors[zone]?.color || COLORS.cyan,
    }));
  }, [filtered]);

  // 2. Type distribution (top 12)
  const typeData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ name: type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [filtered]);

  // 3. Rating distribution
  const ratingData = useMemo(() => {
    const buckets = {};
    filtered.forEach(l => {
      const bucket = Math.floor(l.googleRating * 2) / 2; // 0.5 increments
      const key = bucket.toFixed(1);
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([rating, count]) => ({ rating: parseFloat(rating), count }))
      .sort((a, b) => a.rating - b.rating);
  }, [filtered]);

  // 4. Fee distribution
  const feeData = useMemo(() => {
    const buckets = [
      { range: 'Free', min: 0, max: 0, count: 0 },
      { range: '₹1-50', min: 1, max: 50, count: 0 },
      { range: '₹51-100', min: 51, max: 100, count: 0 },
      { range: '₹101-250', min: 101, max: 250, count: 0 },
      { range: '₹251-500', min: 251, max: 500, count: 0 },
      { range: '₹500+', min: 501, max: Infinity, count: 0 },
    ];
    filtered.forEach(l => {
      for (const b of buckets) {
        if (l.entranceFee >= b.min && l.entranceFee <= b.max) { b.count++; break; }
      }
    });
    return buckets;
  }, [filtered]);

  // 5. Significance breakdown
  const significanceData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.significance] = (counts[l.significance] || 0) + 1; });
    return Object.entries(counts).map(([sig, count]) => ({
      name: sig, value: count, color: SIGNIFICANCE_COLORS[sig] || COLORS.cyan,
    }));
  }, [filtered]);

  // 6. Scatter: Fee vs Rating (value matrix)
  const scatterData = useMemo(() => {
    return filtered.map(l => ({
      name: l.name,
      fee: l.entranceFee,
      rating: l.googleRating,
      reviews: l.reviewsInLakhs,
      zone: l.zone,
      color: zoneColors[l.zone]?.color || COLORS.cyan,
    }));
  }, [filtered]);

  // 7. Zone-wise reviews (heatmap-like)
  const zoneReviewsData = useMemo(() => {
    const agg = {};
    landmarks.forEach(l => {
      if (!agg[l.zone]) agg[l.zone] = { totalReviews: 0, count: 0, avgRating: 0, totalTime: 0, totalFee: 0 };
      agg[l.zone].totalReviews += l.reviewsInLakhs;
      agg[l.zone].count++;
      agg[l.zone].avgRating += l.googleRating;
      agg[l.zone].totalTime += l.timeNeeded;
      agg[l.zone].totalFee += l.entranceFee;
    });
    return Object.entries(agg).map(([zone, d]) => ({
      zone,
      reviews: parseFloat(d.totalReviews.toFixed(1)),
      landmarks: d.count,
      avgRating: parseFloat((d.avgRating / d.count).toFixed(2)),
      avgTime: parseFloat((d.totalTime / d.count).toFixed(1)),
      avgFee: Math.round(d.totalFee / d.count),
      color: zoneColors[zone]?.color || COLORS.cyan,
    }));
  }, []);

  // 8. Top 10 by rating
  const top10 = useMemo(() => {
    return [...filtered].sort((a, b) => b.googleRating - a.googleRating || b.reviewsInLakhs - a.reviewsInLakhs).slice(0, 10);
  }, [filtered]);

  // 9. Top states by landmark count
  const stateData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.state] = (counts[l.state] || 0) + 1; });
    return Object.entries(counts)
      .map(([state, count]) => ({ name: state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  // 10. Radar: Zone comparison
  const radarData = useMemo(() => {
    return zoneReviewsData.map(z => ({
      zone: z.zone,
      'Landmarks': z.landmarks,
      'Avg Rating': z.avgRating * 20, // scale to 0-100
      'Reviews (L)': z.reviews,
      'Avg Time (h)': z.avgTime * 10,
      'Avg Fee (₹)': z.avgFee / 5,
    }));
  }, [zoneReviewsData]);

  // 11. Time needed distribution area
  const timeData = useMemo(() => {
    const buckets = {};
    filtered.forEach(l => {
      const t = Math.round(l.timeNeeded);
      buckets[t] = (buckets[t] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([time, count]) => ({ time: `${time}h`, count }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }, [filtered]);

  // 12. DSLR stats
  const dslrData = useMemo(() => {
    const yes = filtered.filter(l => l.dslrAllowed).length;
    return [
      { name: 'Allowed', value: yes, color: COLORS.green },
      { name: 'Not Allowed', value: filtered.length - yes, color: COLORS.red },
    ];
  }, [filtered]);

  // 13. Best time to visit
  const bestTimeData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.bestTimeToVisit] = (counts[l.bestTimeToVisit] || 0) + 1; });
    return Object.entries(counts)
      .map(([time, count]) => ({ name: time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filtered]);

  // 14. Treemap: Type breakdown
  const treemapData = useMemo(() => {
    const counts = {};
    filtered.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, size], i) => ({ name, size, color: TYPE_COLORS[i % TYPE_COLORS.length] }))
      .sort((a, b) => b.size - a.size);
  }, [filtered]);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const avgRating = (filtered.reduce((s, l) => s + l.googleRating, 0) / filtered.length).toFixed(1);
    const avgFee = Math.round(filtered.reduce((s, l) => s + l.entranceFee, 0) / filtered.length);
    const totalReviews = filtered.reduce((s, l) => s + l.reviewsInLakhs, 0).toFixed(1);
    const freeCount = filtered.filter(l => l.entranceFee === 0).length;
    const avgTime = (filtered.reduce((s, l) => s + l.timeNeeded, 0) / filtered.length).toFixed(1);
    const dslrPct = Math.round((filtered.filter(l => l.dslrAllowed).length / filtered.length) * 100);
    return [
      { label: 'Landmarks', value: filtered.length, icon: '◈', color: COLORS.cyan },
      { label: 'Avg Rating', value: avgRating, icon: '★', color: COLORS.gold },
      { label: 'Total Reviews', value: `${totalReviews}L`, icon: '💬', color: COLORS.purple },
      { label: 'Free Entry', value: freeCount, icon: '🎫', color: COLORS.green },
      { label: 'Avg Fee', value: `₹${avgFee}`, icon: '₹', color: COLORS.orange },
      { label: 'Avg Visit', value: `${avgTime}h`, icon: '⏱', color: COLORS.teal },
    ];
  }, [filtered]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen px-4 sm:px-6 py-8"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl md:text-5xl font-[Outfit] font-bold mb-2">
          <span className="text-gradient-mixed">Analytics</span>{' '}
          <span className="text-[var(--color-text-primary)]">Dashboard</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Comprehensive visual analysis of 325 Indian landmarks — ratings, fees, reviews, and more.
        </p>
      </motion.div>

      {/* Zone Slicer */}
      <motion.div
        className="glass-strong p-3 rounded-2xl mb-8 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <span className="text-xs text-[var(--color-text-muted)] px-2 font-medium">ZONE</span>
        {['All', ...ZONE_COLORS_ARRAY.map(z => z.zone)].map(z => {
          const isActive = activeZone === z;
          const zc = zoneColors[z];
          return (
            <motion.button
              key={z}
              onClick={() => setActiveZone(z)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isActive ? 'border shadow-lg' : 'hover:bg-[rgba(255,255,255,0.04)] text-[var(--color-text-muted)]'}`}
              style={isActive ? {
                background: z === 'All' ? 'rgba(0,242,255,0.12)' : `rgba(${zc?.rgb || '0,242,255'}, 0.15)`,
                borderColor: z === 'All' ? 'rgba(0,242,255,0.3)' : `rgba(${zc?.rgb || '0,242,255'}, 0.35)`,
                color: z === 'All' ? COLORS.cyan : zc?.color,
                boxShadow: `0 0 16px rgba(${zc?.rgb || '0,242,255'}, 0.15)`,
              } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {z === 'All' ? '🌍 All Zones' : z}
            </motion.button>
          );
        })}
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">
          Showing <span className="text-[var(--color-cyber-cyan)] font-bold">{filtered.length}</span> landmarks
        </span>
      </motion.div>

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {kpis.map(kpi => (
          <motion.div
            key={kpi.label}
            variants={itemVariants}
            className="glass p-4 text-center group cursor-default"
            whileHover={{ scale: 1.05, y: -4, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${kpi.color}22` }}
          >
            <div className="text-xl mb-1" style={{ color: kpi.color }}>{kpi.icon}</div>
            <div className="text-2xl font-[Outfit] font-bold text-[var(--color-text-primary)]">{kpi.value}</div>
            <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 uppercase tracking-wider">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Chart 1: Zone Distribution (Donut) ── */}
        <ChartCard title="Zone Distribution" subtitle="Landmarks by geographical zone" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={zoneData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                paddingAngle={3} strokeWidth={0}>
                {zoneData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}44)` }} />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 2: Top Types (Horizontal Bar) ── */}
        <ChartCard title="Landmark Types" subtitle="Top categories by count" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={typeData} layout="vertical" margin={{ left: 10, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={85} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(0,242,255,0.04)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 3: Rating Distribution (Area) ── */}
        <ChartCard title="Rating Distribution" subtitle="Google rating spread" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ratingData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="rating" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="count" stroke={COLORS.gold} fill="url(#ratingGrad)" strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS.gold, strokeWidth: 0 }} activeDot={{ r: 6, fill: COLORS.gold, stroke: '#0a0f1e', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 4: Value Matrix Scatter ── */}
        <ChartCard title="Value Matrix" subtitle="Entrance Fee vs Google Rating (bubble = reviews)" variants={itemVariants} span="2">
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="fee" name="Fee" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                label={{ value: 'Entrance Fee (₹)', position: 'bottom', offset: -2, style: { fill: '#64748b', fontSize: 10 } }} />
              <YAxis dataKey="rating" name="Rating" domain={[3.8, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#64748b', fontSize: 10 } }} />
              <ZAxis dataKey="reviews" range={[30, 350]} name="Reviews (L)" />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="glass-strong px-4 py-3 rounded-xl text-xs" style={{ border: `1px solid ${d.color}44` }}>
                    <p className="font-bold text-[var(--color-text-primary)] mb-1">{d.name}</p>
                    <p style={{ color: d.color }}>Zone: {d.zone}</p>
                    <p className="text-[var(--color-ethereal-gold)]">Fee: ₹{d.fee}</p>
                    <p className="text-[var(--color-cyber-cyan)]">Rating: {d.rating}</p>
                    <p className="text-[var(--color-text-secondary)]">Reviews: {d.reviews}L</p>
                  </div>
                );
              }} />
              {ZONE_COLORS_ARRAY.map(({ zone, color }) => (
                <Scatter key={zone} name={zone} data={scatterData.filter(d => d.zone === zone)} fill={color} fillOpacity={0.65}
                  strokeWidth={0} />
              ))}
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 5: Significance (Donut) ── */}
        <ChartCard title="Significance" subtitle="Historical, Religious, Natural, Cultural" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={significanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                paddingAngle={4} strokeWidth={0}>
                {significanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}44)` }} />
                ))}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 6: Zone Reviews (Tourist Density) ── */}
        <ChartCard title="Tourist Density by Zone" subtitle="Total Google reviews (in lakhs)" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={zoneReviewsData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(0,242,255,0.04)' }} />
              <Bar dataKey="reviews" name="Reviews (L)" radius={[8, 8, 0, 0]} barSize={36}>
                {zoneReviewsData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 8px ${entry.color}33)` }} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 7: Top States ── */}
        <ChartCard title="Top States" subtitle="Most landmarks by state" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stateData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="stateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 8 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(0,242,255,0.04)' }} />
              <Bar dataKey="count" name="Landmarks" fill="url(#stateGrad)" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 8: Fee Distribution ── */}
        <ChartCard title="Fee Distribution" subtitle="Entrance fee ranges" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={feeData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,202,40,0.04)' }} />
              <Bar dataKey="count" name="Landmarks" fill="url(#feeGrad)" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 9: Zone Radar ── */}
        <ChartCard title="Zone Comparison Radar" subtitle="Multi-metric zone analysis" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Landmarks" dataKey="Landmarks" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Avg Rating" dataKey="Avg Rating" stroke={COLORS.gold} fill={COLORS.gold} fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Reviews" dataKey="Reviews (L)" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.1} strokeWidth={2} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
              <Tooltip content={<GlassTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 10: Visit Duration (Area) ── */}
        <ChartCard title="Visit Duration" subtitle="Time needed distribution" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="count" stroke={COLORS.purple} fill="url(#timeGrad)" strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.purple, strokeWidth: 0 }} activeDot={{ r: 5, fill: COLORS.purple, stroke: '#0a0f1e', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 11: Best Time to Visit (Bar) ── */}
        <ChartCard title="Best Time to Visit" subtitle="Popular visiting seasons" variants={itemVariants} span="1">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bestTimeData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="bestTimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(34,197,94,0.04)' }} />
              <Bar dataKey="count" name="Landmarks" fill="url(#bestTimeGrad)" radius={[6, 6, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 12: DSLR + Airport (Mini Donuts Row) ── */}
        <ChartCard title="Photography & Access" subtitle="DSLR policy and airport proximity" variants={itemVariants} span="1">
          <div className="flex gap-4 h-[280px]">
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2">DSLR Allowed</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={dslrData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={4} strokeWidth={0}>
                    {dslrData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.green }} /> Yes</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.red }} /> No</span>
              </div>
            </div>
            <div className="w-px bg-[var(--color-glass-border)]" />
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Airport ({'<'}50km)</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nearby', value: filtered.filter(l => l.airportNearby).length, color: COLORS.blue },
                      { name: 'Far', value: filtered.filter(l => !l.airportNearby).length, color: '#64748b' },
                    ]}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={4} strokeWidth={0}
                  >
                    <Cell fill={COLORS.blue} />
                    <Cell fill="#64748b" />
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.blue }} /> Nearby</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#64748b' }} /> Far</span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* ── Chart 13: Top 10 Landmarks Table ── */}
        <ChartCard title="Top 10 Landmarks" subtitle="Highest rated destinations" variants={itemVariants} span="2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-glass-border)]">
                  <th className="text-left py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">#</th>
                  <th className="text-left py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Name</th>
                  <th className="text-left py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">City</th>
                  <th className="text-left py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Zone</th>
                  <th className="text-right py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Rating</th>
                  <th className="text-right py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Reviews</th>
                  <th className="text-right py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Fee</th>
                  <th className="text-right py-2.5 px-3 text-[var(--color-cyber-cyan)] font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((l, i) => {
                  const zc = zoneColors[l.zone];
                  return (
                    <motion.tr
                      key={l.id}
                      className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,242,255,0.03)] transition-colors ${i % 2 === 0 ? 'bg-[rgba(255,255,255,0.01)]' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                    >
                      <td className="py-2.5 px-3 font-bold text-[var(--color-text-muted)]">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[var(--color-text-primary)]">{l.name}</td>
                      <td className="py-2.5 px-3 text-[var(--color-text-secondary)]">{l.city}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          style={{ background: `rgba(${zc?.rgb || '0,242,255'}, 0.12)`, color: zc?.color || COLORS.cyan }}>
                          {l.zone}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[var(--color-ethereal-gold)]">★ {l.googleRating}</td>
                      <td className="py-2.5 px-3 text-right text-[var(--color-text-secondary)]">{l.reviewsInLakhs}L</td>
                      <td className="py-2.5 px-3 text-right text-[var(--color-text-secondary)]">{l.entranceFee === 0 ? 'Free' : `₹${l.entranceFee}`}</td>
                      <td className="py-2.5 px-3 text-right text-[var(--color-text-secondary)]">{l.timeNeeded}h</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* ── Chart 14: Zone Metrics Cards ── */}
        <ChartCard title="Zone Deep Dive" subtitle="Key metrics per zone" variants={itemVariants} span="1">
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {zoneReviewsData.map((z, i) => (
              <motion.div
                key={z.zone}
                className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: z.color }}>{z.zone}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{z.landmarks} landmarks</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <div className="text-[var(--color-text-muted)]">Rating</div>
                    <div className="font-bold text-[var(--color-ethereal-gold)]">★ {z.avgRating}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)]">Reviews</div>
                    <div className="font-bold text-[var(--color-text-primary)]">{z.reviews}L</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)]">Avg Time</div>
                    <div className="font-bold text-[var(--color-text-primary)]">{z.avgTime}h</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)]">Avg Fee</div>
                    <div className="font-bold text-[var(--color-text-primary)]">₹{z.avgFee}</div>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: z.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(z.landmarks / 150) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}

// Reusable chart card container
function ChartCard({ title, subtitle, children, variants, span = '1' }) {
  const spanClass = span === '2' ? 'lg:col-span-2' : span === '3' ? 'lg:col-span-3 xl:col-span-3' : '';
  return (
    <motion.div
      variants={variants}
      className={`glass p-5 ${spanClass}`}
      whileHover={{ boxShadow: 'var(--shadow-float-lg)', borderColor: 'rgba(255,255,255,0.12)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-[Outfit] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        {subtitle && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
