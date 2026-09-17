"use client";

import { useEffect, useState } from "react";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

function resolveTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const SKY: Record<TimeOfDay, [string, string, string]> = {
  morning: ["#fef3c7", "#fde68a", "#bae6fd"],
  afternoon: ["#bae6fd", "#7dd3fc", "#38bdf8"],
  evening: ["#fecaca", "#fdba74", "#a78bfa"],
  night: ["#1e293b", "#0f172a", "#020617"],
};

const COPY: Record<TimeOfDay, { greeting: string; subtitle: string }> = {
  morning: { greeting: "Good morning", subtitle: "Rise, shine, and grab your coffee" },
  afternoon: { greeting: "Good afternoon", subtitle: "Perfect time for a pick-me-up" },
  evening: { greeting: "Good evening", subtitle: "Wind down with something warm" },
  night: { greeting: "Good night", subtitle: "A late brew never hurt anyone" },
};

const SUN_POS: Record<"morning" | "afternoon" | "evening", { x: number; y: number; r: number; color: string }> = {
  morning: { x: 60, y: 48, r: 22, color: "#fbbf24" },
  afternoon: { x: 300, y: 40, r: 24, color: "#fbbf24" },
  evening: { x: 330, y: 100, r: 30, color: "#fb923c" },
};

const STAR_POSITIONS: [number, number][] = [
  [30, 20], [70, 15], [120, 30], [180, 18], [230, 35], [270, 12], [320, 25], [360, 40],
  [50, 55], [150, 50], [210, 60], [300, 55], [20, 70], [340, 70], [380, 20],
];

// A time-of-day scene above the drink picker: rising sun with spinning rays
// in the morning, a high bright sun at midday, a sinking glow with birds at
// dusk, and a starlit moon at night. Purely CSS/SVG, no network images.
export default function GreetingScene({ name }: { name: string }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");

  useEffect(() => {
    const update = () => setTimeOfDay(resolveTimeOfDay(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const [skyFrom, skyVia, skyTo] = SKY[timeOfDay];
  const { greeting, subtitle } = COPY[timeOfDay];
  const isNight = timeOfDay === "night";
  const isDay = timeOfDay === "morning" || timeOfDay === "afternoon";
  const sun = !isNight ? SUN_POS[timeOfDay] : null;

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      <svg
        viewBox="0 0 400 150"
        className="block h-40 w-full sm:h-48"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="dc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyFrom} />
            <stop offset="55%" stopColor={skyVia} />
            <stop offset="100%" stopColor={skyTo} />
          </linearGradient>
          <filter id="dc-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <rect width="400" height="150" fill="url(#dc-sky)" />

        {(isNight || timeOfDay === "evening") &&
          STAR_POSITIONS.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isNight ? 1.6 : 1}
              fill="#ffffff"
              opacity={isNight ? 0.9 : 0.35}
              className="origin-center animate-twinkle [transform-box:fill-box]"
              style={{ animationDelay: `${(i % 6) * 0.4}s`, animationDuration: `${2 + (i % 3)}s` }}
            />
          ))}

        {isNight ? (
          <g className="origin-center animate-sun-glow [transform-box:fill-box]">
            <circle cx="330" cy="35" r="26" fill="#e2e8f0" opacity="0.5" filter="url(#dc-glow)" />
            <circle cx="330" cy="35" r="18" fill="#f8fafc" />
            <circle cx="323" cy="29" r="15" fill={skyFrom} />
          </g>
        ) : (
          sun && (
            <>
              {timeOfDay === "morning" && (
                <g
                  className="origin-center animate-ray-spin [transform-box:fill-box]"
                  style={{ transformOrigin: `${sun.x}px ${sun.y}px` }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line
                      key={i}
                      x1={sun.x}
                      y1={sun.y}
                      x2={sun.x}
                      y2={sun.y - 38}
                      stroke={sun.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.55"
                      transform={`rotate(${i * 45} ${sun.x} ${sun.y})`}
                    />
                  ))}
                </g>
              )}
              <g className="origin-center animate-sun-glow [transform-box:fill-box]">
                <circle cx={sun.x} cy={sun.y} r={sun.r + 14} fill={sun.color} opacity="0.45" filter="url(#dc-glow)" />
                <circle cx={sun.x} cy={sun.y} r={sun.r} fill={sun.color} />
              </g>
            </>
          )
        )}

        {isDay && (
          <>
            <g className="animate-cloud-drift" style={{ animationDuration: "34s" }}>
              <ellipse cx="60" cy="40" rx="26" ry="12" fill="white" opacity="0.85" />
              <ellipse cx="82" cy="34" rx="18" ry="10" fill="white" opacity="0.85" />
            </g>
            <g className="animate-cloud-drift" style={{ animationDuration: "44s", animationDelay: "-14s" }}>
              <ellipse cx="220" cy="25" rx="22" ry="10" fill="white" opacity="0.7" />
              <ellipse cx="238" cy="20" rx="14" ry="8" fill="white" opacity="0.7" />
            </g>
          </>
        )}

        {timeOfDay === "evening" && (
          <>
            <path
              d="M40 60 q6 -8 12 0 q6 -8 12 0"
              stroke="#78350f"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="animate-cloud-drift"
              style={{ animationDuration: "18s" }}
            />
            <path
              d="M100 42 q5 -7 10 0 q5 -7 10 0"
              stroke="#78350f"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="animate-cloud-drift"
              style={{ animationDuration: "22s", animationDelay: "-8s" }}
            />
          </>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/40 via-black/5 to-transparent p-5 sm:p-6">
        <h1 className="animate-fade-up text-2xl font-extrabold text-white drop-shadow sm:text-3xl">
          {greeting}, {name}!
        </h1>
        <p
          className="animate-fade-up text-sm text-white/90 sm:text-base"
          style={{ animationDelay: "0.1s" }}
        >
          {subtitle} — what would you like today?
        </p>
      </div>
    </div>
  );
}
