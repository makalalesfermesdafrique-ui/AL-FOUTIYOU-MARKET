const sky = (id: string, a: string, b: string) => <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
export default function Art({ slug }: { slug: string }) {
  const c = { viewBox: '0 0 400 250', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': slug } as const
  if (slug === 'terrains') return (
    <svg {...c}>{sky('t', '#9fd8f0', '#e9f7e4')}<rect width="400" height="250" fill="url(#t)" /><circle cx="318" cy="62" r="30" fill="#ffd35c" />
      <path d="M0 160 Q110 110 220 150 T400 130 V250 H0Z" fill="#7cc27a" /><path d="M0 190 Q140 150 260 185 T400 175 V250 H0Z" fill="#4fa467" />
      <path d="M110 175 L250 165 L285 205 L90 215Z" fill="#e8c76a" stroke="#fff" strokeWidth="3" strokeDasharray="8 6" />
      {[[110, 175], [250, 165], [285, 205], [90, 215]].map(([x, y], i) => <g key={i}><rect x={x - 3} y={y - 22} width="6" height="24" fill="#8a5a2b" /><path d={`M${x + 3} ${y - 22} l16 6 -16 6z`} fill="#e63946" /></g>)}</svg>)
  if (slug === 'immobilier') return (
    <svg {...c}>{sky('i', '#8fd0ee', '#f4efe0')}<rect width="400" height="250" fill="url(#i)" /><circle cx="70" cy="60" r="26" fill="#ffd35c" />
      <rect y="195" width="400" height="55" fill="#58a86a" /><rect x="110" y="110" width="190" height="95" fill="#fdf6e3" /><path d="M95 112 L205 52 L315 112Z" fill="#c0563b" />
      <rect x="185" y="150" width="40" height="55" fill="#0f3d2e" /><rect x="128" y="130" width="40" height="34" fill="#9fd8f0" stroke="#fff" strokeWidth="4" /><rect x="242" y="130" width="40" height="34" fill="#9fd8f0" stroke="#fff" strokeWidth="4" />
      <circle cx="345" cy="170" r="24" fill="#2f8a52" /><rect x="342" y="185" width="6" height="22" fill="#6b4423" /></svg>)
  if (slug === 'automobiles') return (
    <svg {...c}>{sky('a', '#ffd9a0', '#f6e9cf')}<rect width="400" height="250" fill="url(#a)" /><circle cx="320" cy="70" r="34" fill="#fff4c2" />
      <rect y="190" width="400" height="60" fill="#46505a" /><path d="M0 222 H400" stroke="#f3d58a" strokeWidth="4" strokeDasharray="26 18" />
      <path d="M70 175 L96 135 Q104 124 118 124 H236 Q252 124 262 138 L292 172 Q312 176 316 192 V200 H62 V188 Q62 178 70 175Z" fill="#0f3d2e" />
      <path d="M108 139 H168 V170 H92Z M178 139 H240 L268 170 H178Z" fill="#bfe6f5" /><circle cx="118" cy="202" r="23" fill="#222" /><circle cx="118" cy="202" r="10" fill="#cfd6dc" /><circle cx="264" cy="202" r="23" fill="#222" /><circle cx="264" cy="202" r="10" fill="#cfd6dc" /></svg>)
  return (
    <svg {...c}>{sky('m', '#b9e1f5', '#eaf5e6')}<rect width="400" height="250" fill="url(#m)" /><circle cx="76" cy="62" r="26" fill="#ffd35c" />
      <rect y="200" width="400" height="50" fill="#4f5963" /><path d="M0 228 H400" stroke="#f3d58a" strokeWidth="4" strokeDasharray="26 18" />
      <circle cx="130" cy="190" r="34" fill="none" stroke="#222" strokeWidth="9" /><circle cx="290" cy="190" r="34" fill="none" stroke="#222" strokeWidth="9" />
      <path d="M130 190 L180 130 H235 L290 190 M180 130 L205 190 H130 M235 130 L252 108 H278" stroke="#0f3d2e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M170 128 Q200 100 236 126Z" fill="#f2a91d" /></svg>)
}
