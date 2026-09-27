export function getAvatarGradient(seed: string): { bg: string; ring: string; initials: string } {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const gradients = [
    { bg: 'from-[#EAE0D5] via-[#C6AC8F] to-[#5E503F]', ring: 'ring-[#C6AC8F]', textColor: 'text-[#22333B]' },
    { bg: 'from-[#F2E9E4] via-[#C9ADA7] to-[#4A4E69]', ring: 'ring-[#C9ADA7]', textColor: 'text-[#22223B]' },
    { bg: 'from-[#E8C2B9] via-[#DDBEA9] to-[#6B705C]', ring: 'ring-[#E8C2B9]', textColor: 'text-[#3E4334]' },
    { bg: 'from-[#D8E2DC] via-[#FFE5D9] to-[#FFCAD4]', ring: 'ring-[#D8E2DC]', textColor: 'text-[#4A403A]' },
    { bg: 'from-[#ECE4DB] via-[#D1BFA7] to-[#8C7A6B]', ring: 'ring-[#D1BFA7]', textColor: 'text-[#2D241E]' },
    { bg: 'from-[#E5E5E5] via-[#D4D4D4] to-[#737373]', ring: 'ring-[#A3A3A3]', textColor: 'text-[#171717]' },
  ];

  const selected = gradients[hash % gradients.length];
  const initials = seed.slice(0, 2).toUpperCase();

  return {
    bg: selected.bg,
    ring: selected.ring,
    initials
  };
}

export function AvatarBadge({
  seed,
  size = 'md',
  className = ''
}: {
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const { bg, ring, initials } = getAvatarGradient(seed);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg font-medium',
    xl: 'w-24 h-24 text-2xl font-semibold',
  };

  return (
    <div
      className={`relative rounded-full bg-gradient-to-tr ${bg} flex items-center justify-center text-white/90 shadow-xs border border-white/40 ring-1 ${ring} select-none ${sizeClasses[size]} ${className}`}
    >
      <span className="tracking-wider opacity-90 drop-shadow-xs font-mono">{initials}</span>
      {/* Subtle organic watermark highlight */}
      <div className="absolute inset-0 rounded-full bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
}
