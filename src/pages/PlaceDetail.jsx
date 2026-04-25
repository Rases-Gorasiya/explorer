import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLandmarkById, getRelatedLandmarks, zoneColors } from '../data/filters';
import LandmarkCard from '../components/LandmarkCard';

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const landmark = getLandmarkById(id);

  if (!landmark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-12 text-center">
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="text-xl font-[Outfit] font-bold mb-2">Landmark not found</h2>
          <Link to="/" className="text-[var(--color-cyber-cyan)] hover:underline text-sm">
            ← Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  const zone = zoneColors[landmark.zone] || { color: '#00f2ff', rgb: '0, 242, 255' };
  const related = getRelatedLandmarks(landmark);

  const infoItems = [
    { label: 'Time Needed', value: `${landmark.timeNeeded} hours`, icon: '⏱' },
    { label: 'Entrance Fee', value: landmark.entranceFee === 0 ? 'Free' : `₹${landmark.entranceFee}`, icon: '🎫' },
    { label: 'Google Rating', value: `${landmark.googleRating} / 5`, icon: '⭐' },
    { label: 'Reviews', value: `${landmark.reviewsInLakhs}L+ reviews`, icon: '💬' },
    { label: 'Best Time', value: landmark.bestTimeToVisit, icon: '📅' },
    { label: 'DSLR Allowed', value: landmark.dslrAllowed ? 'Yes' : 'No', icon: '📷' },
    { label: 'Weekly Off', value: landmark.weeklyOff || 'None', icon: '🚫' },
    { label: 'Airport Nearby', value: landmark.airportNearby ? 'Yes (within 50km)' : 'No', icon: '✈️' },
    { label: 'Type', value: landmark.type, icon: '🏷' },
    { label: 'Significance', value: landmark.significance, icon: '⚜' },
    { label: 'Established', value: landmark.establishmentYear > 0 ? landmark.establishmentYear : 'Ancient', icon: '🏛' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <motion.button
          onClick={() => navigate(-1)}
          className="glass-button px-4 py-2 text-sm flex items-center gap-2 mb-6"
          whileHover={{ scale: 1.03, x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          ← Back
        </motion.button>
      </div>

      {/* Hero section */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          className="glass overflow-hidden"
          layoutId={`card-${landmark.id}`}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {/* Header gradient */}
          <div
            className="relative h-56 md:h-72 flex items-end p-8"
            style={{
              background: `linear-gradient(135deg, rgba(${zone.rgb}, 0.15) 0%, var(--color-deep-space) 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-[120px] select-none">
                {landmark.type === 'Temple' ? '🕉' :
                 landmark.type === 'Fort' ? '🏰' :
                 landmark.type === 'Palace' ? '🏛' :
                 landmark.type === 'Monument' ? '🗿' :
                 landmark.type === 'Beach' ? '🌊' :
                 landmark.type === 'Hill Station' ? '⛰' : '◈'}
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase"
                  style={{
                    background: `rgba(${zone.rgb}, 0.15)`,
                    border: `1px solid rgba(${zone.rgb}, 0.3)`,
                    color: zone.color,
                  }}
                >
                  {landmark.zone} Zone
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)]">
                  {landmark.type}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)]">
                  {landmark.significance}
                </span>
              </div>
              <motion.h1
                className="text-3xl md:text-5xl font-[Outfit] font-bold text-[var(--color-text-primary)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {landmark.name}
              </motion.h1>
              <motion.p
                className="text-base text-[var(--color-text-secondary)] mt-2 flex items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                📍 {landmark.city}, {landmark.state}
              </motion.p>
            </div>
          </div>

          {/* Description */}
          <div className="p-8">
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
              {landmark.description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Info Grid */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-[Outfit] font-bold mb-6">
          <span className="text-gradient-gold">Details</span> & Info
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              className="glass p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-xs text-[var(--color-text-muted)] mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="glass p-8">
          <h3 className="text-xl font-[Outfit] font-bold mb-6 text-gradient-cyan">Visitor Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricBar
              label="Google Rating"
              value={landmark.googleRating}
              max={5}
              color={zone.color}
              rgb={zone.rgb}
              displayValue={`${landmark.googleRating}/5`}
            />
            <MetricBar
              label="Reviews Volume"
              value={landmark.reviewsInLakhs}
              max={3.5}
              color="#ffca28"
              rgb="255, 202, 40"
              displayValue={`${landmark.reviewsInLakhs}L+`}
            />
            <MetricBar
              label="Visit Duration"
              value={landmark.timeNeeded}
              max={10}
              color="#a855f7"
              rgb="168, 85, 247"
              displayValue={`${landmark.timeNeeded} hrs`}
            />
          </div>
        </div>
      </div>

      {/* Related Places */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h2 className="text-2xl font-[Outfit] font-bold mb-6">
            Related <span className="text-gradient-cyan">Landmarks</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((l, i) => (
              <LandmarkCard key={l.id} landmark={l} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricBar({ label, value, max, color, rgb, displayValue }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{displayValue}</span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, rgba(${rgb}, 0.5), ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
