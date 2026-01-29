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
  targetRange?: string; // For display purposes: "34 - 52"
}

export type UsageProfile = 'residential' | 'commercial' | 'flat';

// Specific Ranges defined by user
// 05:30 -> Hour 5 (05:00-06:00)
// 06:30 -> Hour 6 (06:00-07:00)
// 11:30 -> Hour 11
// 12:30 -> Hour 12
// 15:30 -> Hour 15
// 16:30 -> Hour 16
const TARGET_RANGES: Record<number, [number, number]> = {
  5: [15, 28],
  6: [15, 29],
  11: [34, 52],
  12: [34, 52],
  15: [22, 36],
  16: [22, 36]
};

// Helper to get a random number in range
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
  
  // 1. Generate "Ideal" Profile based on Rules
  // We create a raw distribution first, then scale it to match the Total Diff.
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
    
    let rawVal = 0;
    let isPeak = false;

    if (range && profile === 'residential') {
      // It's a specific target hour
      rawVal = randomInRange(range[0], range[1]);
      isPeak = true;
    } else {
      // Non-target hour: Generate a low "base" usage
      // e.g., 2 to 8 m3 for quiet hours
      // Night time (22-04) should be lower
      if (currentHour >= 22 || currentHour <= 4) {
         rawVal = randomInRange(1, 4);
      } else {
         rawVal = randomInRange(5, 12);
      }
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
  // If user inputs 100, but our ideal profile sums to 200, we scale everything by 0.5
  const scaleRatio = totalDiff / idealTotal;

  segments.forEach(seg => {
    seg.rawValue = seg.rawValue * scaleRatio;
  });

  // 3. SMOOTHING & BALANCING (The "Avoid 49 vs 11" Rule)
  // We iterate through adjacent non-peak pairs and balance them if they are too jagged.
  // We do this BEFORE rounding to keep precision.
  if (divisions > 1) {
    for (let i = 0; i < segments.length - 1; i++) {
      const curr = segments[i];
      const next = segments[i+1];

      // Only smooth if BOTH are non-peak (Peaks have their own volatility rules)
      if (!curr.isPeak && !next.isPeak) {
         const pairTotal = curr.rawValue + next.rawValue;
         const diff = Math.abs(curr.rawValue - next.rawValue);
         
         // If difference is more than 30% of the pair total, smooth it
         if (diff > (pairTotal * 0.3)) {
            const avg = pairTotal / 2;
            // Add a tiny bit of noise so they aren't identical
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

  // 5. Fix Remainder (Exact Sum Logic)
  let remainder = Math.round((totalDiff - currentDistributedSum) * factor) / factor;
  const step = 1 / factor;

  let safety = 0;
  while (remainder > (step/10) && safety < 1000) {
     // Distribute remainder to random segments, preferring Peaks to keep non-peaks smooth
     const targetIdx = Math.floor(Math.random() * segments.length);
     segments[targetIdx].finalValue = parseFloat((segments[targetIdx].finalValue + step).toFixed(precision));
     remainder -= step;
     safety++;
  }
  
  // Handle negative remainder (if we overshot due to rounding up)
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
    
    // Format target range for display (scaled if necessary, or raw if close)
    // We show the raw rule range to help user verify logic, even if scaled value is different
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

  return results;
};

export const formatNumber = (num: number, precision: number = 1): string => {
  return num.toFixed(precision);
};
