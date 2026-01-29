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
  startHour: number = 8, // Default start time 08:00
  profile: UsageProfile = 'residential'
): CalculationResult[] => {
  const totalDiff = endMeter - startMeter;
  
  if (totalDiff <= 0 || divisions <= 0) {
    return [];
  }

  // 1. Calculate Base Weights for each hour
  let totalWeight = 0;
  const segments: { hour: number; weight: number; rawValue: number; finalValue: number }[] = [];

  for (let i = 0; i < divisions; i++) {
    const currentHour = (startHour + i) % 24;
    // Add some randomness to the weight so it's not identical every time (±15%)
    const randomFactor = 0.85 + Math.random() * 0.3; 
    const baseWeight = getWeight(currentHour, profile);
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
  // We need 1 decimal place precision.
  let currentDistributedSum = 0;

  segments.forEach(seg => {
    const rawShare = (seg.weight / totalWeight) * totalDiff;
    // Floor to 1 decimal place initially to avoid overshooting
    const roundedShare = Math.floor(rawShare * 10) / 10;
    seg.finalValue = roundedShare;
    currentDistributedSum += roundedShare;
  });

  // 3. Fix the Remainder (The "Smart" Correction)
  // Because we floored everything, we have a remainder to distribute.
  // Remainder will be in multiples of 0.1
  let remainder = Math.round((totalDiff - currentDistributedSum) * 10) / 10;
  
  // Distribute remainder 0.1 at a time to the segments with the highest weights (peaks)
  // or randomly among the top 50% to keep it natural.
  while (remainder > 0.05) { // tolerance for float errors
    // Pick a random segment, preferably one that is a "peak" (high weight)
    // to absorb the extra usage naturally.
    const candidates = segments.filter(s => s.weight > (totalWeight / divisions) * 0.5);
    const targetIndex = Math.floor(Math.random() * candidates.length);
    const targetSegment = candidates[targetIndex] || segments[Math.floor(Math.random() * segments.length)];
    
    targetSegment.finalValue = parseFloat((targetSegment.finalValue + 0.1).toFixed(1));
    remainder -= 0.1;
  }

  // 4. Construct Final Results
  const results: CalculationResult[] = [];
  let runningTotal = startMeter;

  segments.forEach((seg, index) => {
    runningTotal += seg.finalValue;
    
    // Determine if it's a peak hour for labeling
    const isPeak = seg.weight > (totalWeight / divisions) * 1.2;

    results.push({
      id: index + 1,
      label: `Period ${index + 1}`,
      hourLabel: `${String(seg.hour).padStart(2, '0')}:00`,
      value: seg.finalValue,
      cumulative: parseFloat(runningTotal.toFixed(1)),
      isPeak
    });
  });

  // Final sanity check: Force the last cumulative to be exactly EndMeter
  // just in case of any tiny float drift, though the logic above handles it.
  if (results.length > 0) {
    const last = results[results.length - 1];
    const diff = endMeter - last.cumulative;
    if (Math.abs(diff) > 0.001) {
       last.cumulative = endMeter;
       last.value = parseFloat((last.value + diff).toFixed(1));
    }
  }

  return results;
};

export const formatNumber = (num: number): string => {
  return num.toFixed(1);
};
