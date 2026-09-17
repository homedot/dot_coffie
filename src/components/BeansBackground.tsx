const BEANS = [
  { top: "8%", left: "6%", size: 28, rotate: -20, delay: "0s" },
  { top: "18%", left: "88%", size: 22, rotate: 30, delay: "1.2s" },
  { top: "70%", left: "3%", size: 34, rotate: 12, delay: "0.6s" },
  { top: "82%", left: "92%", size: 24, rotate: -12, delay: "1.8s" },
  { top: "45%", left: "95%", size: 18, rotate: 45, delay: "2.4s" },
  { top: "55%", left: "1%", size: 20, rotate: -35, delay: "3s" },
];

// Subtle floating coffee-bean shapes used behind every screen for atmosphere.
export default function BeansBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {BEANS.map((bean, i) => (
        <svg
          key={i}
          viewBox="0 0 32 44"
          className="absolute animate-float opacity-[0.12]"
          style={{
            top: bean.top,
            left: bean.left,
            width: bean.size,
            height: bean.size * 1.4,
            transform: `rotate(${bean.rotate}deg)`,
            animationDelay: bean.delay,
          }}
        >
          <path
            d="M16 2C8 2 2 12 2 22s6 20 14 20 14-10 14-20S24 2 16 2Z"
            fill="var(--color-coffee-800)"
          />
          <path d="M16 4c0 14-1 26-1 36" stroke="var(--color-coffee-50)" strokeWidth="2.5" fill="none" />
        </svg>
      ))}
    </div>
  );
}
