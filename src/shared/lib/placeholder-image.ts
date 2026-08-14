/**
 * Deterministic stock photo for prototype data — same seed always resolves
 * to the same image, so a gym/court keeps a stable "photo" across renders.
 * Swap for real uploaded photo URLs once there's a backend to store them.
 */
export function placeholderPhoto(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}
