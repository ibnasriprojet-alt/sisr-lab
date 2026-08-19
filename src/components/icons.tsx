/* Icônes SVG dessinées sur mesure — trait 1.7, coins vifs, esprit réseau. */

type P = { className?: string };
const base = (className?: string) => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconGrid = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3.5" y="3.5" width="7" height="7" />
    <rect x="13.5" y="3.5" width="7" height="7" />
    <rect x="3.5" y="13.5" width="7" height="7" />
    <path d="M17 13.5v7M13.5 17h7" />
  </svg>
);

export const IconStack = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5l8.5 4.2L12 11.9 3.5 7.7 12 3.5z" />
    <path d="M3.5 12.2l8.5 4.2 8.5-4.2" />
    <path d="M3.5 16.6l8.5 4.2 8.5-4.2" />
  </svg>
);

export const IconSpark = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
    <path d="M12 8.2l1.1 2.7 2.7 1.1-2.7 1.1L12 15.8l-1.1-2.7-2.7-1.1 2.7-1.1L12 8.2z" />
    <path d="M18.5 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" strokeWidth="1.3" />
  </svg>
);

export const IconFlask = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M9.5 3.5h5M10.5 3.5v5.2L5 18a2 2 0 001.8 3h10.4A2 2 0 0019 18l-5.5-9.3V3.5" />
    <path d="M7.6 14.5h8.8" />
    <circle cx="10.5" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="13.8" cy="18.6" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCards = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="7.5" y="5.5" width="13" height="13" rx="1.5" />
    <path d="M5.5 15.5v-9a2 2 0 012-2h9" />
    <path d="M11.5 10.5h5M11.5 13.5h3" />
  </svg>
);

export const IconBolt = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M13 3.5L5.5 13.5h5L11 20.5l7.5-10h-5L13 3.5z" />
  </svg>
);

export const IconFlame = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5c1 3-3.5 4.5-3.5 8a5.5 5.5 0 0011 0c0-2-1-3.6-2.2-4.8-.2 1-.7 1.8-1.6 2.3.3-2-.9-4.4-3.7-5.5z" />
    <path d="M12 20.5a3 3 0 01-3-3c0-1.8 1.6-2.6 3-4.5 1.4 1.9 3 2.7 3 4.5a3 3 0 01-3 3z" strokeWidth="1.3" />
  </svg>
);

export const IconArrow = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

export const IconCross = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconServer = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="4" y="4" width="16" height="7" rx="1" />
    <rect x="4" y="13" width="16" height="7" rx="1" />
    <circle cx="7.5" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="7.5" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
    <path d="M11 7.5h6M11 16.5h6" strokeWidth="1.3" />
  </svg>
);

export const IconNet = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="5.5" cy="6" r="2" />
    <circle cx="18.5" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
    <path d="M7.4 6.6l7.4 9.9M16.6 6.6L9.2 16.5M7.5 6h9" />
  </svg>
);

export const IconShield = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5l7.5 3v5.5c0 4.6-3.2 7.4-7.5 8.5-4.3-1.1-7.5-3.9-7.5-8.5V6.5l7.5-3z" />
    <path d="M9 11.8l2.2 2.2 4-4.5" />
  </svg>
);

export const IconCube = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3.5l7.5 4.3v8.4L12 20.5l-7.5-4.3V7.8L12 3.5z" />
    <path d="M4.5 7.8L12 12l7.5-4.2M12 12v8.5" />
  </svg>
);

export const IconTerminal = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M7 9.5l3.5 3-3.5 3M12.5 15.5h4.5" />
  </svg>
);

export const IconSend = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M20.5 3.5L10 14M20.5 3.5l-6.8 17-3.7-6.5L3.5 10l17-6.5z" />
  </svg>
);

export const IconRefresh = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4.5 12a7.5 7.5 0 0113-5.2l2 2M19.5 12a7.5 7.5 0 01-13 5.2l-2-2" />
    <path d="M19.5 4.5v4.3h-4.3M4.5 19.5v-4.3h4.3" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2.5" />
  </svg>
);

export const IconBook = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 6.5c-1.8-1.6-4.5-2-8-1.8v13.5c3.5-.2 6.2.2 8 1.8 1.8-1.6 4.5-2 8-1.8V4.7c-3.5-.2-6.2.2-8 1.8z" />
    <path d="M12 6.5V20" />
  </svg>
);

export const IconTarget = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconChip = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="7" y="7" width="10" height="10" rx="1" />
    <path d="M10 2.5V7M14 2.5V7M10 17v4.5M14 17v4.5M2.5 10H7M2.5 14H7M17 10h4.5M17 14h4.5" strokeWidth="1.4" />
  </svg>
);
