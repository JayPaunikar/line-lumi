/**
 * HDB3 Test Runner - Manual verification
 * Run this in browser console to test HDB3 encoding/decoding
 */

import { encodeHDB3 } from './encoders';
import { decodeHDB3 } from './decoders';

export function runHDB3Tests() {
  const samplesPerBit = 10;
  const amplitude = 1.0;
  const results: { test: string; input: string; passed: boolean; symbols?: string }[] = [];

  /**
   * Helper: Convert samples array to symbolic representation
   * Returns array of symbols: '+', '-', or '0' for each bit
   */
  function samplesToSymbols(samples: number[], samplesPerBit: number): string[] {
    const symbols: string[] = [];
    for (let i = 0; i < samples.length; i += samplesPerBit) {
      const value = samples[i];
      if (Math.abs(value) < 0.1) {
        symbols.push('0');
      } else if (value > 0) {
        symbols.push('+');
      } else {
        symbols.push('-');
      }
    }
    return symbols;
  }

  console.log('🧪 Running HDB3 Encoder/Decoder Tests...\n');

  // Test 1: Basic round-trip
  console.log('Test 1: Basic round-trip encoding/decoding');
  const testCases = ['10110011', '11110000', '101010', '00001111'];
  testCases.forEach(bits => {
    const encoded = encodeHDB3(bits, samplesPerBit, amplitude);
    const decoded = decodeHDB3(encoded, samplesPerBit, amplitude);
    const passed = decoded === bits;
    results.push({ test: `Round-trip: ${bits}`, input: bits, passed });
    console.log(`  ${bits} → ${passed ? '✅ PASS' : '❌ FAIL'} (decoded: ${decoded})`);
  });

  // Test 2: Mixed 4-zero runs
  console.log('\nTest 2: Mixed 4-zero runs and ordinary ones');
  const bits2 = '1110000111100001111';
  const encoded2 = encodeHDB3(bits2, samplesPerBit, amplitude);
  const decoded2 = decodeHDB3(encoded2, samplesPerBit, amplitude);
  const symbols2 = samplesToSymbols(encoded2, samplesPerBit);
  const passed2 = decoded2 === bits2;
  results.push({ test: 'Mixed 4-zero runs', input: bits2, passed: passed2, symbols: symbols2.join('') });
  console.log(`  Input:   ${bits2}`);
  console.log(`  Symbols: ${symbols2.join('')}`);
  console.log(`  Decoded: ${decoded2}`);
  console.log(`  ${passed2 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 3: Eight consecutive zeros
  console.log('\nTest 3: Eight consecutive zeros');
  const bits3 = '00000000';
  const encoded3 = encodeHDB3(bits3, samplesPerBit, amplitude);
  const decoded3 = decodeHDB3(encoded3, samplesPerBit, amplitude);
  const symbols3 = samplesToSymbols(encoded3, samplesPerBit);
  const passed3 = decoded3 === bits3;
  results.push({ test: 'Eight zeros', input: bits3, passed: passed3, symbols: symbols3.join('') });
  console.log(`  Input:   ${bits3}`);
  console.log(`  Symbols: ${symbols3.join('')}`);
  console.log(`  Decoded: ${decoded3}`);
  console.log(`  ${passed3 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 4: Alternating (no substitution)
  console.log('\nTest 4: Alternating 1s and 0s (no substitution)');
  const bits4 = '1010101010';
  const encoded4 = encodeHDB3(bits4, samplesPerBit, amplitude);
  const decoded4 = decodeHDB3(encoded4, samplesPerBit, amplitude);
  const symbols4 = samplesToSymbols(encoded4, samplesPerBit);
  const passed4 = decoded4 === bits4;
  results.push({ test: 'Alternating', input: bits4, passed: passed4, symbols: symbols4.join('') });
  console.log(`  Input:   ${bits4}`);
  console.log(`  Symbols: ${symbols4.join('')} (should be AMI: +-+-+-...)`);
  console.log(`  Decoded: ${decoded4}`);
  console.log(`  ${passed4 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 5: Even pulse count → 000V
  console.log('\nTest 5: Even pulse count → 000V');
  const bits5 = '110000';
  const encoded5 = encodeHDB3(bits5, samplesPerBit, amplitude);
  const decoded5 = decodeHDB3(encoded5, samplesPerBit, amplitude);
  const symbols5 = samplesToSymbols(encoded5, samplesPerBit);
  const passed5 = decoded5 === bits5;
  results.push({ test: 'Even → 000V', input: bits5, passed: passed5, symbols: symbols5.join('') });
  console.log(`  Input:   ${bits5}`);
  console.log(`  Symbols: ${symbols5.join('')} (expected: +-000-)`);
  console.log(`  Decoded: ${decoded5}`);
  console.log(`  ${passed5 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 6: Odd pulse count → B00V
  console.log('\nTest 6: Odd pulse count → B00V');
  const bits6 = '10000';
  const encoded6 = encodeHDB3(bits6, samplesPerBit, amplitude);
  const decoded6 = decodeHDB3(encoded6, samplesPerBit, amplitude);
  const symbols6 = samplesToSymbols(encoded6, samplesPerBit);
  const passed6 = decoded6 === bits6;
  results.push({ test: 'Odd → B00V', input: bits6, passed: passed6, symbols: symbols6.join('') });
  console.log(`  Input:   ${bits6}`);
  console.log(`  Symbols: ${symbols6.join('')} (expected: +-00+)`);
  console.log(`  Decoded: ${decoded6}`);
  console.log(`  ${passed6 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 7: Random sequences
  console.log('\nTest 7: Random sequences (100 trials)');
  let randomPassed = 0;
  for (let trial = 0; trial < 100; trial++) {
    const length = 50;
    const randomBits = Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
    const encodedRandom = encodeHDB3(randomBits, samplesPerBit, amplitude);
    const decodedRandom = decodeHDB3(encodedRandom, samplesPerBit, amplitude);
    if (decodedRandom === randomBits) randomPassed++;
  }
  const passed7 = randomPassed === 100;
  results.push({ test: 'Random sequences', input: '100 trials', passed: passed7 });
  console.log(`  ${randomPassed}/100 trials passed ${passed7 ? '✅ PASS' : '❌ FAIL'}`);

  // Summary
  console.log('\n📊 Test Summary:');
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  console.log(`  Total: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n✅ All HDB3 tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Review implementation.');
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test} (input: ${r.input})`);
    });
  }

  return { results, passedTests, totalTests };
}

// Auto-run on import (comment out if you want manual control)
// runHDB3Tests();
