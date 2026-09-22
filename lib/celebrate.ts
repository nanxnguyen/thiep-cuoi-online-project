// A short burst of gold-and-red confetti for happy moments (invitation published, guest says "I'll come").
// Browser only. canvas-confetti is loaded on demand so it is not part of any first load, and it stays silent for
// people who asked their system for reduced motion. Pass a canvas to draw inside a <dialog>: the dialog sits in the
// browser's top layer, above any page-level canvas.
export async function celebrate(canvas?: HTMLCanvasElement | null): Promise<void> {
  const { default: confetti } = await import("canvas-confetti");
  const fire = canvas ? confetti.create(canvas, { resize: true, useWorker: false }) : confetti;
  const base = { colors: ["#d9b45f", "#a3181f", "#f6ecd6", "#8a6420"], disableForReducedMotion: true, zIndex: 400, origin: { y: canvas ? 0.55 : 0.7 } };
  const burst = (ratio: number, options: Record<string, number>) => fire({ ...base, ...options, particleCount: Math.floor(160 * ratio) });
  burst(0.25, { spread: 26, startVelocity: 55 });
  burst(0.2, { spread: 60 });
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  burst(0.1, { spread: 120, startVelocity: 45 });
}
