/**
 * Smart Estimation Logic with Pattern Learning
 * Handles fluctuating water usage patterns and learns from historical data.
 */

export interface CalculationResult {
  id: number;
  label: string;
  hourLabel: string;
  value: number;
  cumulative: number;
  isPeak: boolean;
  targetRange?: string;
}

export type UsageProfile = 'residential' | 'commercial' | 'flat';

// --- LEARNING MODULE START ---
const MEMORY_KEY = 'smart_water_pattern_memory';

interface HourlyWeight {
  totalWeight: number;
  count: number;
}

// Load memory from local storage
const getMemory = (): Record<number, HourlyWeight> => {
  try {
    const data = localStorage.getItem(MEMORY_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Save new pattern to memory
const learnPattern = (results: CalculationResult[], startHour: number) => {
  const memory = getMemory();
  const totalVolume = results.reduce((acc, curr) => acc + curr.value, 0);

  if (totalVolume === 0) return;

  results.forEach((res, index) => {
    // Determine actual hour (0-23)
    const hour = (startHour + index) % 24;
    
    // Calculate weight (percentage of total usage)
    const weight = res.value / totalVolume;

    if (!memory[hour]) {
      memory[hour] = { totalWeight: 0, count: 0 };
    }

    memory[hour].totalWeight += weight;
    memory[hour].count += 1;
  });

  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
};

// Get learned bias for a specific hour
const getLearnedBias = (hour: number): number | null => {
  const memory = getMemory();
  if (memory[hour] && memory[hour].count > 0) {
    return memory[hour].totalWeight / memory[hour].count;
  }
  return null;
};
// --- LEARNING MODULE END ---

const TARGET_RANGES: Record<number, [number, number]> = {
  5: [15, 28],
  6: [15, 29],
  11: [34, 52],
  12: [34, 52],
  15: [22, 36],
  16: [22, 36]
};

const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
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

  const factor = Math.pow(10, precision); 
  
  // 1. Generate Raw Profile (incorporating Learning)
  let segments: { 
    hour: number; 
    rawValue: number; 
    finalValue: number; 
    isPeak: boolean;
    min?: number;
    max?: number;
  }[] = [];

  let idealTotal = 0;

  for (let i = 0; i < divisions; i++) {
    const currentHour = (startHour + i) % 24;
    const range = TARGET_RANGES[currentHour];
    const learnedWeight = getLearnedBias(currentHour);
    
    let rawVal = 0;
    let isPeak = false;

    // Base Logic
    if (range && profile === 'residential') {
      rawVal = randomInRange(range[0], range[1]);
      isPeak = true;
    } else {
      if (currentHour >= 22 || currentHour <= 4) {
         rawVal = randomInRange(1, 4);
      } else {
         rawVal = randomInRange(5, 12);
      }
    }

    // Apply Learning (Influence)
    // If we have learned data, we blend it: 70% Base Rule, 30% Learned History
    // We normalize learned weight (which is a %) to a magnitude comparable to rawVal
    if (learnedWeight !== null) {
       // Estimate a magnitude based on current rawVal to scale the weight
       // This is a heuristic to nudge the random value towards historical trends
       const learnedMagnitude = learnedWeight * (idealTotal || (rawVal * divisions)); 
       // Since idealTotal is building up, we use a simpler multiplier for now
       // Let's just boost/dampen based on relative weight
       // Average hourly weight is 1/24 (~0.04). 
       
       const influenceFactor = learnedWeight / 0.04; // > 1 means heavy usage hour historically
       
       // Blend:
       rawVal = (rawVal * 0.7) + (rawVal * influenceFactor * 0.3);
    }

    segments.push({
      hour: currentHour,
      rawValue: rawVal,
      finalValue: 0,
      isPeak,
      min: range ? range[0] : undefined,
      max: range ? range[1] : undefined
    });

    idealTotal += rawVal;
  }

  // 2. Scale to match Actual Total
  const scaleRatio = totalDiff / idealTotal;
  segments.forEach(seg => {
    seg.rawValue = seg.rawValue * scaleRatio;
  });

  // 3. Smoothing
  if (divisions > 1) {
    for (let i = 0; i < segments.length - 1; i++) {
      const curr = segments[i];
      const next = segments[i+1];

      if (!curr.isPeak && !next.isPeak) {
         const pairTotal = curr.rawValue + next.rawValue;
         const diff = Math.abs(curr.rawValue - next.rawValue);
         
         if (diff > (pairTotal * 0.3)) {
            const avg = pairTotal / 2;
            const noise = avg * 0.1 * (Math.random() - 0.5); 
            curr.rawValue = avg + noise;
            next.rawValue = avg - noise;
         }
      }
    }
  }

  // 4. Rounding
  let currentDistributedSum = 0;
  segments.forEach(seg => {
    const rounded = Math.floor(seg.rawValue * factor) / factor;
    seg.finalValue = rounded;
    currentDistributedSum += rounded;
  });

  // 5. Fix Remainder
  let remainder = Math.round((totalDiff - currentDistributedSum) * factor) / factor;
  const step = 1 / factor;
  let safety = 0;

  while (remainder > (step/10) && safety < 1000) {
     const targetIdx = Math.floor(Math.random() * segments.length);
     segments[targetIdx].finalValue = parseFloat((segments[targetIdx].finalValue + step).toFixed(precision));
     remainder -= step;
     safety++;
  }
  
  while (remainder < -(step/10) && safety < 2000) {
     const targetIdx = Math.floor(Math.random() * segments.length);
     if (segments[targetIdx].finalValue > step) {
        segments[targetIdx].finalValue = parseFloat((segments[targetIdx].finalValue - step).toFixed(precision));
        remainder += step;
     }
     safety++;
  }

  // 6. Construct Results
  const results: CalculationResult[] = [];
  let runningTotal = startMeter;

  segments.forEach((seg, index) => {
    runningTotal += seg.finalValue;
    
    let rangeDisplay = "-";
    if (seg.min && seg.max) {
        rangeDisplay = `${seg.min} - ${seg.max}`;
    }

    results.push({
      id: index + 1,
      label: `Period ${index + 1}`,
      hourLabel: `${String(seg.hour).padStart(2, '0')}:00`,
      value: seg.finalValue,
      cumulative: parseFloat(runningTotal.toFixed(precision)),
      isPeak: seg.isPeak,
      targetRange: rangeDisplay
    });
  });

  // Final sanity check
  if (results.length > 0) {
      const last = results[results.length - 1];
      const diff = endMeter - last.cumulative;
      if (Math.abs(diff) > (step/10)) {
          last.cumulative = endMeter;
          last.value = parseFloat((last.value + diff).toFixed(precision));
      }
  }

  // --- TRIGGER LEARNING ---
  // We save this pattern to memory so next time it influences the generation
  learnPattern(results, startHour);

  return results;
};

export const formatNumber = (num: number, precision: number = 1): string => {
  return num.toFixed(precision);
};
