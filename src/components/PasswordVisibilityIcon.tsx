// Eye / eye-with-slash glyph for the show/hide password toggle.
export default function PasswordVisibilityIcon({
  visible,
  size = 20,
}: {
  visible: boolean;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!visible && <line x1="2" y1="2" x2="22" y2="22" />}
    </svg>
  );
}
