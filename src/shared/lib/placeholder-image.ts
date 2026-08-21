/**
 * Deterministic stock photo for prototype data — same seed always resolves
 * to the same image, so a gym/court keeps a stable "photo" across renders.
 * Swap for real uploaded photo URLs once there's a backend to store them.
 */
export function placeholderPhoto(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

export function placeholderQr(label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" role="img" aria-label="${label}">
      <rect width="280" height="280" rx="24" fill="#ffffff"/>
      <rect x="18" y="18" width="244" height="244" rx="18" fill="#111827"/>
      <rect x="38" y="38" width="52" height="52" fill="#ffffff"/>
      <rect x="50" y="50" width="28" height="28" fill="#111827"/>
      <rect x="190" y="38" width="52" height="52" fill="#ffffff"/>
      <rect x="202" y="50" width="28" height="28" fill="#111827"/>
      <rect x="38" y="190" width="52" height="52" fill="#ffffff"/>
      <rect x="50" y="202" width="28" height="28" fill="#111827"/>
      <g fill="#ffffff">
        <rect x="112" y="40" width="14" height="14"/>
        <rect x="138" y="40" width="14" height="14"/>
        <rect x="164" y="40" width="14" height="14"/>
        <rect x="112" y="66" width="14" height="14"/>
        <rect x="164" y="66" width="14" height="14"/>
        <rect x="112" y="92" width="14" height="14"/>
        <rect x="138" y="92" width="14" height="14"/>
        <rect x="164" y="92" width="14" height="14"/>
        <rect x="112" y="118" width="14" height="14"/>
        <rect x="138" y="118" width="14" height="14"/>
        <rect x="164" y="118" width="14" height="14"/>
        <rect x="40" y="118" width="14" height="14"/>
        <rect x="66" y="118" width="14" height="14"/>
        <rect x="92" y="118" width="14" height="14"/>
        <rect x="190" y="118" width="14" height="14"/>
        <rect x="216" y="118" width="14" height="14"/>
        <rect x="92" y="144" width="14" height="14"/>
        <rect x="118" y="144" width="14" height="14"/>
        <rect x="144" y="144" width="14" height="14"/>
        <rect x="170" y="144" width="14" height="14"/>
        <rect x="196" y="144" width="14" height="14"/>
        <rect x="222" y="144" width="14" height="14"/>
        <rect x="118" y="170" width="14" height="14"/>
        <rect x="144" y="170" width="14" height="14"/>
        <rect x="170" y="170" width="14" height="14"/>
        <rect x="92" y="196" width="14" height="14"/>
        <rect x="118" y="196" width="14" height="14"/>
        <rect x="170" y="196" width="14" height="14"/>
        <rect x="196" y="196" width="14" height="14"/>
        <rect x="222" y="196" width="14" height="14"/>
        <rect x="118" y="222" width="14" height="14"/>
        <rect x="144" y="222" width="14" height="14"/>
        <rect x="196" y="222" width="14" height="14"/>
      </g>
      <text x="140" y="266" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#111827">
        ${label}
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
