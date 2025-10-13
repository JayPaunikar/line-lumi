import { EncodingType } from '@/components/ControlsPanel';

function getSampleValue(samples: number[], index: number): number {
  if (index < 0 || index >= samples.length) return 0;
  return samples[index];
}

export function decodeNRZ(samples: number[], samplesPerBit: number): string {
  let bits = '';
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const value = getSampleValue(samples, midPoint);
    bits += value > 0 ? '1' : '0';
  }
  return bits;
}

export function decodeRZ(samples: number[], samplesPerBit: number): string {
  let bits = '';
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const quarterPoint = i + Math.floor(samplesPerBit / 4);
    const value = getSampleValue(samples, quarterPoint);
    bits += value > 0 ? '1' : '0';
  }
  return bits;
}

export function decodeNRZI(samples: number[], samplesPerBit: number): string {
  if (samples.length === 0) return '';

  let bits = '';
  let previousLevel = getSampleValue(samples, 0); // start with first sample

  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const currentLevel = getSampleValue(samples, midPoint);

    if (i === 0) {
      // First bit: convention depends on initial level, assume '0'
      bits += '0';
    } else {
      // Transition = 1, no transition = 0
      bits += Math.sign(currentLevel) !== Math.sign(previousLevel) ? '1' : '0';
    }

    previousLevel = currentLevel;
  }

  return bits;
}


export function decodeManchester(samples: number[], samplesPerBit: number): string {
  let bits = '';
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const firstQuarter = i + Math.floor(samplesPerBit / 4);
    const thirdQuarter = i + Math.floor(3 * samplesPerBit / 4);
    
    const firstValue = getSampleValue(samples, firstQuarter);
    const secondValue = getSampleValue(samples, thirdQuarter);
    
    // Low to high = 1, high to low = 0
    if (firstValue < 0 && secondValue > 0) {
      bits += '1';
    } else {
      bits += '0';
    }
  }
  return bits;
}

export function decodeDiffManchester(samples: number[], samplesPerBit: number): string {
  if (samples.length === 0) return '';

  let bits = '';
  const half = Math.floor(samplesPerBit / 2);

  // Initial previous mid-bit sample
  let previousMid = getSampleValue(samples, half / 2);

  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const startSample = getSampleValue(samples, i);
    const midSample = getSampleValue(samples, i + half);

    // 0 bit: transition at start (start != previous mid)
    // 1 bit: no transition at start
    bits += Math.sign(startSample) !== Math.sign(previousMid) ? '0' : '1';

    previousMid = midSample; // update previous mid-bit for next bit
  }

  return bits;
}

export function decodeAMI(samples: number[], samplesPerBit: number): string {
  let bits = '';
  for (let i = 0; i < samples.length; i += samplesPerBit) {
    const midPoint = i + Math.floor(samplesPerBit / 2);
    const value = getSampleValue(samples, midPoint);
    
    // Zero voltage = 0, any polarity = 1
    bits += Math.abs(value) > 0.1 ? '1' : '0';
  }
  return bits;
}

export function decode(samples: number[], encoding: EncodingType, samplesPerBit: number): string {
  if (samples.length === 0) return '';
  
  switch (encoding) {
    case 'NRZ':
      return decodeNRZ(samples, samplesPerBit);
    case 'RZ':
      return decodeRZ(samples, samplesPerBit);
    case 'NRZI':
      return decodeNRZI(samples, samplesPerBit);
    case 'Manchester':
      return decodeManchester(samples, samplesPerBit);
    case 'DiffManchester':
      return decodeDiffManchester(samples, samplesPerBit);
    case 'AMI':
      return decodeAMI(samples, samplesPerBit);
    default:
      return decodeNRZ(samples, samplesPerBit);
  }
}

export function findErrors(original: string, decoded: string): number[] {
  const errors: number[] = [];
  const minLen = Math.min(original.length, decoded.length);
  
  for (let i = 0; i < minLen; i++) {
    if (original[i] !== decoded[i]) {
      errors.push(i);
    }
  }
  
  return errors;
}
