/**
 * Smart Estimation Logic
 * Handles fluctuating water usage patterns based on time of day.
 */

export interface CalculationResult {
  id: number;
  label: string;
  hourLabel: string; // e.g., "08:00 - 09:00"
  value: number; // The consumption
  cumulative: number; // The meter reading
  isPeak: boolean;
}

export type UsageProfile = 'residential' | 'commercial' | 'flat';

// Weights for Residential: Peaks at 6-9 (Morning) and 17-20 (Evening)
const RESIDENTIAL_WEIGHTS: Record<number, number> = {
  0: 0.2, 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.3, 5: 0.8, // Late night / Early morning
  6: 2.5, 7: 3.0, 8: 2.5, 9: 1.5, 10: 1.2, 11: 1.0, // Morning Peak
  12: 1.1, 13: 1.0, 14: 1.0, 15: 1.1, 16: 1.5, // Afternoon
  17: 2.5, 18: 3.0, 19: 2.5, 20: 2.0, 21: 1.5, // Evening Peak
  22: 1.0, 23: 0.5 // Night
};

// Weights for Commercial: High during 8-17, low otherwise
const COMMERCIAL_WEIGHTS: Record<number, number> = {
  0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.2,
  6: 0.5, 7: 1.0, 8: 3.0, 9: 3.5, 10: 3.5, 11: 3.5,
  12: 3.0, 13: 3.5, 14: 3.5, 15: 3.5, 16: 3.0,
  17: 1.5, 18: 0.5, 19: 0.2, 20: 0.1, 21: 0.1,
  22: 0.1, 23: 0.1
};

const getWeight = (hour: number, profile: UsageProfile): number => {
  const h = hour % 24;
  if (profile === 'residential') return RESIDENTIAL_WEIGHTS[h] || 1.0;
  if (profile === 'commercial') return COMMERCIAL_WEIGHTS[h] || 1.0;
  return 1.0; // Flat
};

export const distributeValue = (
  startMeter: number,
  endMeter: number,
  divisions: number,
  startHour: number = 8,
  profile: UsageProfile = 'residential',
  precision: number = 1
): CalculationResult[] => {
  const totalDiff = endMeter - startMeter;
  
  if (totalDiff <= 0 || divisions <= 0) {
    return [];
  }

  const factor = Math.pow(10, precision); // e.g., 10 for 1 decimal, 1 for 0 decimals

  // 1. Calculate Base Weights with HIGH Volatility
  let totalWeight = 0;
  const segments: { hour: number; weight: number; rawValue: number; finalValue: number }[] = [];

  for (let i = 0; i < divisions; i++) {
    const currentHour = (startHour + i) % 24;
    const baseWeight = getWeight(currentHour, profile);
    
    // Volatility Logic:
    // 1. Base Randomness: ±50% variance (0.5 to 1.5) - Increased base variance
    // 2. Spike Chance: 20% chance to double the weight (simulating a shower or machine)
    // 3. Drop Chance: 20% chance to halve the weight (simulating inactivity)
    
    let randomFactor = 0.5 + Math.random() * 1.0; 
    
    // Add realistic spikes that can override the trend
    // E.g., even if baseWeight is low (night), a big spike can make it high
    if (Math.random() < 0.20) randomFactor *= 2.5; // Stronger spike
    if (Math.random() < 0.20) randomFactor *= 0.2; // Stronger drop
    
    // For very short durations, force extreme variance to ensure "Ups and Downs"
    if (divisions < 6) {
        randomFactor = 0.2 + Math.random() * 3.0;
    }

    const weight = baseWeight * randomFactor;
    
    segments.push({
      hour: currentHour,
      weight: weight,
      rawValue: 0,
      finalValue: 0
    });
    totalWeight += weight;
  }

  // 2. Distribute Total Diff based on weights
  let currentDistributedSum = 0;

  segments.forEach(seg => {
    const rawShare = (seg.weight / totalWeight) * totalDiff;
    // Floor to precision to avoid overshooting
    const roundedShare = Math.floor(rawShare * factor) / factor;
    seg.finalValue = roundedShare;
    currentDistributedSum += roundedShare;
  });

  // 3. Fix the Remainder (The "Smart" Correction)
  // Because we floored everything, we have a remainder to distribute.
  let remainder = Math.round((totalDiff - currentDistributedSum) * factor) / factor;
  const step = 1 / factor; // e.g., 0.1 or 1 (if precision is 0)

  // Distribute remainder randomly but weighted towards peaks
  let safetyCounter = 0;
  while (remainder >= step / 2 && safetyCounter < 10000) { 
    const targetIndex = Math.floor(Math.random() * segments.length);
    const targetSegment = segments[targetIndex];
    
    targetSegment.finalValue = parseFloat((targetSegment.finalValue + step).toFixed(precision));
    remainder -= step;
    safetyCounter++;
  }

  // 4. Construct Final Results
  const results: CalculationResult[] = [];
  let runningTotal = startMeter;

  // Calculate average for peak detection
  const avgUsage = totalDiff / divisions;

  segments.forEach((seg, index) => {
    runningTotal += seg.finalValue;
    
    // Determine if it's a peak relative to this specific set of data
    const isPeak = seg.finalValue > avgUsage * 1.1;

    results.push({
      id: index + 1,
      label: `Period ${index + 1}`,
      hourLabel: `${String(seg.hour).padStart(2, '0')}:00`,
      value: seg.finalValue,
      cumulative: parseFloat(runningTotal.toFixed(precision)),
      isPeak
    });
  });

  // Final sanity check: Force the last cumulative to be exactly EndMeter
  if (results.length > 0) {
    const last = results[results.length - 1];
    const diff = endMeter - last.cumulative;
    
    // If there's a tiny drift (floating point error)
    if (Math.abs(diff) > (step / 10)) {
       last.cumulative = endMeter;
       // Adjust the last value to match, ensuring we respect precision
       last.value = parseFloat((last.value + diff).toFixed(precision));
    }
  }

  return results;
};

export const formatNumber = (num: number, precision: number = 1): string => {
  return num.toFixed(precision);
};
