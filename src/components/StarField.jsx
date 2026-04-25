import { useMemo } from 'react';

export default function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  return (
    <div className="starfield">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--twinkle-duration': `${star.duration}s`,
            '--twinkle-delay': `${star.delay}s`,
            opacity: star.opacity,
          }}
        />
      ))}
      {/* Nebula gradients */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(0, 242, 255, 0.03) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.03) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 50% 50%, rgba(255, 202, 40, 0.02) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
