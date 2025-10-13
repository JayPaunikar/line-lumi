/**
 * Gaussian noise generation using Box-Muller transform
 */
export function gaussianRandom(mean: number = 0, std: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  return z0 * std + mean;
}

/**
 * Add Additive White Gaussian Noise (AWGN) to signal samples
 */
export function addAwgn(samples: number[], noiseStd: number): number[] {
  if (noiseStd <= 0) return samples;
  
  return samples.map(sample => sample + gaussianRandom(0, noiseStd));
}
