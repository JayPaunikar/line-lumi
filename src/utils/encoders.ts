import { EncodingType } from '@/components/ControlsPanel';

export function encodeNRZ(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  for (const bit of bits) {
    const value = bit === '1' ? amplitude : -amplitude;
    samples.push(...Array(samplesPerBit).fill(value));
  }
  return samples;
}

export function encodeRZ(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  const halfSamples = Math.floor(samplesPerBit / 2);
  
  for (const bit of bits) {
    const value = bit === '1' ? amplitude : -amplitude;
    // First half: signal value
    samples.push(...Array(halfSamples).fill(value));
    // Second half: return to zero
    samples.push(...Array(samplesPerBit - halfSamples).fill(0));
  }
  return samples;
}

export function encodeNRZI(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  let currentLevel = amplitude; // Start with positive
  
  for (const bit of bits) {
    if (bit === '1') {
      // Transition on 1
      currentLevel = -currentLevel;
    }
    // No transition on 0
    samples.push(...Array(samplesPerBit).fill(currentLevel));
  }
  return samples;
}

export function encodeManchester(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  const halfSamples = Math.floor(samplesPerBit / 2);
  
  for (const bit of bits) {
    if (bit === '1') {
      // 1: low to high transition
      samples.push(...Array(halfSamples).fill(-amplitude));
      samples.push(...Array(samplesPerBit - halfSamples).fill(amplitude));
    } else {
      // 0: high to low transition
      samples.push(...Array(halfSamples).fill(amplitude));
      samples.push(...Array(samplesPerBit - halfSamples).fill(-amplitude));
    }
  }
  return samples;
}

export function encodeDiffManchester(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  const halfSamples = Math.floor(samplesPerBit / 2);
  let currentLevel = amplitude;
  
  for (const bit of bits) {
    if (bit === '0') {
      // Transition at start for 0
      currentLevel = -currentLevel;
    }
    // No start transition for 1
    
    // Always mid-bit transition
    samples.push(...Array(halfSamples).fill(currentLevel));
    currentLevel = -currentLevel;
    samples.push(...Array(samplesPerBit - halfSamples).fill(currentLevel));
  }
  return samples;
}

export function encodeAMI(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  const samples: number[] = [];
  let lastPulse = -amplitude; // Alternate starts negative
  
  for (const bit of bits) {
    if (bit === '1') {
      // Alternate polarity for 1
      lastPulse = -lastPulse;
      samples.push(...Array(samplesPerBit).fill(lastPulse));
    } else {
      // 0 is zero voltage
      samples.push(...Array(samplesPerBit).fill(0));
    }
  }
  return samples;
}

export function encode(bits: string, encoding: EncodingType, samplesPerBit: number, amplitude: number = 1): number[] {
  switch (encoding) {
    case 'NRZ':
      return encodeNRZ(bits, samplesPerBit, amplitude);
    case 'RZ':
      return encodeRZ(bits, samplesPerBit, amplitude);
    case 'NRZI':
      return encodeNRZI(bits, samplesPerBit, amplitude);
    case 'Manchester':
      return encodeManchester(bits, samplesPerBit, amplitude);
    case 'DiffManchester':
      return encodeDiffManchester(bits, samplesPerBit, amplitude);
    case 'AMI':
      return encodeAMI(bits, samplesPerBit, amplitude);
    default:
      return encodeNRZ(bits, samplesPerBit, amplitude);
  }
}
