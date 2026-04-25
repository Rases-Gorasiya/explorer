import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { zoneColors } from '../data/filters';

export default function LandmarkCard({ landmark, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const zone = zoneColors[landmark.zone] || { color: '#00f2ff', rgb: '0, 242, 255' };

  // Generate a gradient based on landmark type
  const typeGradients = {
    Monument: 'linear-gradient(135deg, #0c1220 0%, #1a2a4a 50%, #0d1a30 100%)',
    Fort: 'linear-gradient(135deg, #1a1008 0%, #2d1f0e 50%, #1a1008 100%)',
    Temple: 'linear-gradient(135deg, #1a0c1e 0%, #2d1040 50%, #1a0c1e 100%)',
    Palace: 'linear-gradient(135deg, #1e1a0c 0%, #3d2d10 50%, #1e1a0c 100%)',
    'Hill Station': 'linear-gradient(135deg, #0c1a14 0%, #102d20 50%, #0c1a14 100%)',
    Lake: 'linear-gradient(135deg, #0c1420 0%, #102840 50%, #0c1420 100%)',
    Beach: 'linear-gradient(135deg, #0c181e 0%, #103040 50%, #0c181e 100%)',
    'National Park': 'linear-gradient(135deg, #0e1a0c 0%, #1a3010 50%, #0e1a0c 100%)',
    Cave: 'linear-gradient(135deg, #14100c 0%, #2a1e14 50%, #14100c 100%)',
    default: 'linear-gradient(135deg, #0c1220 0%, #1a2a40 50%, #0c1220 100%)',
  };

  const gradient = typeGradients[landmark.type] || typeGradients.default;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.3;
    return (
      <div className="flex gap-0.5 text-xs">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < full ? 'star-filled' : i === full && hasHalf ? 'star-filled opacity-50' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="perspective-container"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 12,
        delay: index * 0.06,
      }}
    >
      <Link to={`/place/${landmark.id}`}>
        <motion.div
          ref={ref}
          className="card-3d glass relative overflow-hidden cursor-pointer group"
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{
            boxShadow: `0 16px 64px rgba(0,0,0,0.5), 0 0 30px rgba(${zone.rgb}, 0.15)`,
            borderColor: `rgba(${zone.rgb}, 0.3)`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Card Image Area */}
          <div className="relative h-44 overflow-hidden rounded-t-[15px]" style={{ background: gradient }}>
            {/* Type icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-10 select-none">
                {landmark.type === 'Temple' ? '🕉' :
                 landmark.type === 'Fort' ? '🏰' :
                 landmark.type === 'Palace' ? '🏛' :
                 landmark.type === 'Monument' ? '🗿' :
                 landmark.type === 'Beach' ? '🌊' :
                 landmark.type === 'Hill Station' ? '⛰' :
                 landmark.type === 'Lake' ? '💧' :
                 landmark.type === 'National Park' ? '🌿' :
                 landmark.type === 'Cave' ? '🪨' :
                 landmark.type === 'Museum' ? '🏛' :
                 landmark.type === 'Waterfall' ? '💦' : '◈'}
              </span>
            </div>

            {/* Zone badge */}
            <div className="absolute top-3 left-3">
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
                style={{
                  background: `rgba(${zone.rgb}, 0.15)`,
                  border: `1px solid rgba(${zone.rgb}, 0.3)`,
                  color: zone.color,
                }}
              >
                {landmark.zone}
              </span>
            </div>

            {/* Rating badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-[rgba(0,0,0,0.4)] backdrop-blur-sm text-[var(--color-ethereal-gold)] flex items-center gap-1">
                ★ {landmark.googleRating}
              </span>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-deep-space)] to-transparent" />
          </div>

          {/* Card Content */}
          <div className="p-4 relative">
            {/* Name */}
            <h3 className="text-base font-[Outfit] font-semibold text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-cyber-cyan)] transition-colors leading-tight line-clamp-1">
              {landmark.name}
            </h3>

            {/* Location */}
            <p className="text-xs text-[var(--color-text-muted)] mb-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {landmark.city}, {landmark.state}
            </p>

            {/* Stars */}
            <div className="mb-3">{renderStars(landmark.googleRating)}</div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {landmark.timeNeeded}h
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[var(--color-ethereal-gold)]">₹</span>
                {landmark.entranceFee === 0 ? 'Free' : landmark.entranceFee}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {landmark.reviewsInLakhs}L
              </span>
            </div>

            {/* Significance tag */}
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] border border-[rgba(255,255,255,0.06)]">
                {landmark.significance}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] border border-[rgba(255,255,255,0.06)]">
                {landmark.type}
              </span>
            </div>
          </div>

          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 0%, rgba(${zone.rgb}, 0.08) 0%, transparent 60%)`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
