const LogoMark = ({ size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="drop-shadow-sm"
    >
      <defs>
        <radialGradient id="goldGradient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#goldGradient)" />
      <circle cx="22" cy="24" r="3" fill="#0F172A" opacity="0.85" />
      <circle cx="42" cy="20" r="3" fill="#0F172A" opacity="0.85" />
      <circle cx="28" cy="40" r="3" fill="#0F172A" opacity="0.85" />
      <path d="M20 44 C 28 36, 36 34, 44 28" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <text x="32" y="36" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0F172A" fontFamily="Inter, system-ui">R</text>
    </svg>
  );
};

export default LogoMark;

