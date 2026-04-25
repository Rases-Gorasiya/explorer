import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { zoneColors } from '../data/filters';

export default function LandmarkCard({ landmark, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 25 });

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);

    // Set mouse position variables for glow effect
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty('--mouse-x', `${mx}%`);
    ref.current.style.setProperty('--mouse-y', `${my}%`);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const zone = zoneColors[landmark.zone] || { color: '#00f2ff', rgb: '0, 242, 255' };

  // Generate fallback URL based on name or type
  const getFallbackUrl = () => {
    return `https://loremflickr.com/800/600/india,${landmark.name.replace(/\s+/g, '')}`;
  };

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

  return (
    <motion.div
      className="perspective-container p-2"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 12,
        delay: index * 0.04,
      }}
    >
      <Link to={`/place/${landmark.id}`}>
        <motion.div
          ref={ref}
          className="glass-card relative overflow-hidden cursor-pointer group card-3d max-w-[320px]"
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileTap={{ scale: 0.98 }}
        >
          {/* Card Image Area */}
          <div className="relative h-52 overflow-hidden rounded-t-[20px]" style={{ background: gradient }}>
            {/* Real Image */}
            <motion.img
              src={landmark.imageUrl || getFallbackUrl()}
              alt={landmark.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              initial={{ opacity: 0 }}
              onLoad={(e) => e.target.style.opacity = 1}
              loading="lazy"
              onError={(e) => {
                e.target.src = getFallbackUrl();
              }}
            />
            
            {/* Shimmer overlay (only visible while loading or as subtle texture) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Type icon overlay (shown on top of image with low opacity) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity duration-500">
              <span className="text-7xl select-none">
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
            <div className="absolute top-4 left-4 z-10">
              <motion.span
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                style={{
                  background: `rgba(${zone.rgb}, 0.25)`,
                  border: `1px solid rgba(${zone.rgb}, 0.5)`,
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                }}
              >
                {landmark.zone}
              </motion.span>
            </div>

            {/* Rating badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[rgba(10,15,30,0.7)] backdrop-blur-md text-[var(--color-ethereal-gold)] flex items-center gap-1 border border-[rgba(255,255,255,0.2)] shadow-lg">
                ★ {landmark.googleRating}
              </span>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[rgba(5,10,20,1)] via-[rgba(5,10,20,0.4)] to-transparent z-0" />
          </div>

          {/* Card Content */}
          <div className="p-5 relative">
            {/* Name */}
            <h3 className="text-lg font-[Outfit] font-bold text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-cyber-cyan)] transition-colors leading-tight line-clamp-1">
              {landmark.name}
            </h3>

            {/* Location */}
            <p className="text-xs text-[var(--color-text-secondary)] mb-4 flex items-center gap-1.5 font-medium">
              <span className="text-[var(--color-cyber-cyan)] opacity-70">📍</span>
              {landmark.city}, {landmark.state}
            </p>

            {/* Meta info row */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex gap-4">
                <span className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-tighter">Time</span>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">{landmark.timeNeeded}h</span>
                </span>
                <span className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-tighter">Fee</span>
                  <span className="text-xs font-semibold text-[var(--color-ethereal-gold)]">
                    {landmark.entranceFee === 0 ? 'Free' : `₹${landmark.entranceFee}`}
                  </span>
                </span>
              </div>
              
              <div className="flex -space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                 {/* Mini type icons */}
                 <span className="w-5 h-5 rounded-full glass border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[10px]">
                    {landmark.dslrAllowed ? '📷' : '🚫'}
                 </span>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${zone.rgb}, 0.1) 0%, transparent 80%)`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
