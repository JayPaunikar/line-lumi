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

export function encodeB8ZS(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  // B8ZS: Bipolar with 8-Zero Substitution
  // Replace 8 consecutive zeros with: 000VB0VB
  // V = violation (same polarity as last pulse), B = bipolar (opposite)
  const samples: number[] = [];
  let lastPulse = -amplitude; // Track last non-zero pulse polarity
  
  let i = 0;
  while (i < bits.length) {
    // Check for 8 consecutive zeros
    if (i <= bits.length - 8 && bits.substring(i, i + 8) === '00000000') {
      // Apply B8ZS substitution: 000VB0VB
      // V = violation (same as lastPulse), B = bipolar (opposite of lastPulse)
      const V = lastPulse;
      const B = -lastPulse;
      
      samples.push(...Array(samplesPerBit).fill(0)); // 0
      samples.push(...Array(samplesPerBit).fill(0)); // 0
      samples.push(...Array(samplesPerBit).fill(0)); // 0
      samples.push(...Array(samplesPerBit).fill(V)); // V
      samples.push(...Array(samplesPerBit).fill(B)); // B
      samples.push(...Array(samplesPerBit).fill(0)); // 0
      samples.push(...Array(samplesPerBit).fill(V)); // V
      samples.push(...Array(samplesPerBit).fill(B)); // B
      
      lastPulse = B; // Update last pulse
      i += 8;
    } else if (bits[i] === '1') {
      // Normal AMI encoding for 1s
      lastPulse = -lastPulse;
      samples.push(...Array(samplesPerBit).fill(lastPulse));
      i++;
    } else {
      // Single 0
      samples.push(...Array(samplesPerBit).fill(0));
      i++;
    }
  }
  
  return samples;
}

export function encodeHDB3(bits: string, samplesPerBit: number, amplitude: number = 1): number[] {
  /**
   * HDB3: High-Density Bipolar-3 Zeros
   * 
   * Rules:
   * - Replace every run of 4 consecutive zeros (0000) with either 000V or B00V
   * - Maintain pulseCount: number of non-zero pulses since last substitution
   * - Track lastNonZeroPolarity: polarity (+1 or -1) of last emitted non-zero pulse
   * - Track nextPulsePolarity: next polarity for AMI alternation
   * 
   * Substitution rules:
   * - If pulseCount is EVEN → 000V (V has same polarity as lastNonZeroPolarity)
   * - If pulseCount is ODD → B00V (B follows AMI alternation, V has same polarity as lastNonZeroPolarity)
   * 
   * After substitution, reset pulseCount to 0 and update tracking variables.
   */
  const samples: number[] = [];
  
  // Polarity tracking: use +1/-1 normalized values
  let nextPulsePolarity = 1;  // Next AMI pulse polarity (alternates)
  let lastNonZeroPolarity = -1; // Polarity of last emitted non-zero pulse
  let pulseCount = 0; // Number of non-zero pulses since last substitution
  
  let i = 0;
  while (i < bits.length) {
    // Check for 4 consecutive zeros
    if (i <= bits.length - 4 && bits.substring(i, i + 4) === '0000') {
      // Apply HDB3 substitution based on pulseCount
      if (pulseCount % 2 === 0) {
        // EVEN pulseCount → 000V
        // V (violation) has same polarity as lastNonZeroPolarity
        const V = lastNonZeroPolarity * amplitude;
        
        samples.push(...Array(samplesPerBit).fill(0)); // 0
        samples.push(...Array(samplesPerBit).fill(0)); // 0
        samples.push(...Array(samplesPerBit).fill(0)); // 0
        samples.push(...Array(samplesPerBit).fill(V)); // V
        
        // Update tracking: V becomes the last non-zero pulse
        lastNonZeroPolarity = V > 0 ? 1 : -1;
        // nextPulsePolarity should be opposite of V for next normal pulse
        nextPulsePolarity = -lastNonZeroPolarity;
        pulseCount = 0; // Reset pulse count
      } else {
        // ODD pulseCount → B00V
        // B (balancing pulse) follows AMI alternation
        // V (violation) has same polarity as lastNonZeroPolarity (before B)
        const B = nextPulsePolarity * amplitude;
        const V = lastNonZeroPolarity * amplitude;
        
        samples.push(...Array(samplesPerBit).fill(B)); // B
        samples.push(...Array(samplesPerBit).fill(0)); // 0
        samples.push(...Array(samplesPerBit).fill(0)); // 0
        samples.push(...Array(samplesPerBit).fill(V)); // V
        
        // Update tracking: V becomes the last non-zero pulse
        lastNonZeroPolarity = V > 0 ? 1 : -1;
        // nextPulsePolarity should be opposite of V (since V was last)
        nextPulsePolarity = -lastNonZeroPolarity;
        pulseCount = 0; // Reset pulse count
      }
      i += 4;
    } else if (bits[i] === '1') {
      // Normal AMI encoding for '1': alternate polarity
      const pulse = nextPulsePolarity * amplitude;
      samples.push(...Array(samplesPerBit).fill(pulse));
      
      // Update tracking
      lastNonZeroPolarity = nextPulsePolarity;
      nextPulsePolarity = -nextPulsePolarity; // Alternate for next pulse
      pulseCount++; // Increment pulse count
      i++;
    } else {
      // Single '0' (not part of 4-zero run)
      samples.push(...Array(samplesPerBit).fill(0));
      i++;
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
    case 'B8ZS':
      return encodeB8ZS(bits, samplesPerBit, amplitude);
    case 'HDB3':
      return encodeHDB3(bits, samplesPerBit, amplitude);
    default:
      return encodeNRZ(bits, samplesPerBit, amplitude);
  }
}
