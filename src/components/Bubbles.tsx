const B = [
  [6, 54, 0, 16], [14, 22, 4, 13], [24, 78, 2, 20], [36, 30, 7, 15], [47, 62, 1, 18],
  [58, 26, 5, 14], [68, 90, 3, 22], [78, 40, 8, 17], [88, 56, 2, 19], [95, 24, 6, 12],
]
export default function Bubbles() {
  return (
    <div className="bubbles" aria-hidden="true">
      {B.map(([l, z, s, d], i) => <span key={i} style={{ ['--l' as any]: `${l}%`, ['--z' as any]: `${z}px`, ['--s' as any]: `-${s}s`, ['--d' as any]: `${d}s` }} />)}
    </div>
  )
}
