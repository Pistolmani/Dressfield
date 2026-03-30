interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 220 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DressField"
      role="img"
    >
      <circle cx="7" cy="16" r="6" fill="#7C3AED" />
      <text
        x="17"
        y="24"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="26"
        fill="currentColor"
        letterSpacing="-0.3"
      >
        <tspan fontWeight="800">DRESS</tspan>
        <tspan fontWeight="400">Field</tspan>
      </text>
    </svg>
  );
}
