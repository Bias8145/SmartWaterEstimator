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

// REVISED Weights based on specific user request:
// Peaks: 05:30-06:30, 11:30-12:30, 15:00-16:30
// We map these half-hour intervals to the nearest hourly slots.
const RESIDENTIAL_WEIGHTS: Record<number, number> = {
  0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.2, 
  
  // Morning Peak: 05:30 - 06:30
  // Affects Hour 5 (05:00-06:00) and Hour 6 (06:00-07:00)
  5: 2.5, 
  6: 2.5, 
  
  7: 1.0, 8: 0.8, 9: 0.8, 10: 0.8, 
  
  // Lunch Peak: 11:30 - 12:30
  // Affects Hour 11 (11:00-12:00) and Hour 12 (12:00-13:00)
  11: 2.8, 
  12: 2.8, 
  
  13: 0.8, 14: 0.8, 
  
  // Afternoon Peak: 15:00 - 16:30
  // Hour 15 is full peak. Hour 16 is half peak.
  15: 3.0, 
  16: 2.0, 
  
  17: 1.5, 18: 1.0, 19: 0.8, 20: 0.5, 21: 0.3, 
  22: 0.2, 23: 0.1
};

// Commercial weights (Standard business hours)
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

  const factor = Math.pow(10, precision); 
  const MAX_REALISTIC_USAGE = 60; // Secret Rule: Try to keep usage under 60

  // 1. Calculate Base Weights with Volatility
  let totalWeight = 0;
  const segments: { hour: number; weight: number; rawValue: number; finalValue: number }[] = [];

  for (let i = 0; i < divisions; i++) {
    const currentHour = (startHour + i) % 24;
    const baseWeight = getWeight(currentHour, profile);
    
    // Volatility Logic
    let randomFactor = 0.5 + Math.random() * 1.0; // 0.5 to 1.5
    
    // Occasional Spikes/Drops
    if (Math.random() < 0.20) randomFactor *= 2.0; 
    if (Math.random() < 0.20) randomFactor *= 0.3; 
    
    // Short duration volatility boost
    if (divisions < 6) {
        randomFactor = 0.2 + Math.random() * 2.5;
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

  // 2. Initial Distribution
  let currentDistributedSum = 0;
  segments.forEach(seg => {
    // Calculate raw share
    let rawShare = (seg.weight / totalWeight) * totalDiff;
    seg.rawValue = rawShare;
  });

  // 2.5 SECRET RULE: Clamp values > 60 if possible
  // Only apply if the average is reasonable (e.g. < 55)
  // If average is 80, we can't force it under 60.
  if ((totalDiff / divisions) < 55) {
     let excessPool = 0;
     
     // Pass 1: Clamp high values
     segments.forEach(seg => {
        if (seg.rawValue > MAX_REALISTIC_USAGE) {
            const excess = seg.rawValue - MAX_REALISTIC_USAGE;
            // Cap it at 60 (plus a tiny bit of random noise so it doesn't look fake like exactly 60.0)
            // Using 58 + random(2) ensures it's slightly under or exactly at 60
            const cappedValue = MAX_REALISTIC_USAGE - (Math.random() * 1.5);
            
            excessPool += (seg.rawValue - cappedValue);
            seg.rawValue = cappedValue;
        }
     });

     // Pass 2: Distribute excess to lower values
     if (excessPool > 0) {
        // Find segments that have room to grow (e.g., currently < 40)
        const recipients = segments.filter(s => s.rawValue < (MAX_REALISTIC_USAGE - 20));
        
        if (recipients.length > 0) {
            // Distribute unevenly to make it look natural
            let remainingExcess = excessPool;
            recipients.forEach((s, idx) => {
                if (idx === recipients.length - 1) {
                    s.rawValue += remainingExcess;
                } else {
                    const share = (remainingExcess / (recipients.length - idx)) * (0.8 + Math.random() * 0.4);
                    s.rawValue += share;
                    remainingExcess -= share;
                }
            });
        } else {
            // If everyone is high, just spread it back evenly (fallback)
            segments.forEach(s => s.rawValue += (excessPool / segments.length));
        }
     }
  }

  // 3. Rounding & Finalizing
  segments.forEach(seg => {
    const roundedShare = Math.floor(seg.rawValue * factor) / factor;
    seg.finalValue = roundedShare;
    currentDistributedSum += roundedShare;
  });

  // 4. Fix Remainder
  let remainder = Math.round((totalDiff - currentDistributedSum) * factor) / factor;
  const step = 1 / factor;

  let safetyCounter = 0;
  while (remainder >= (step / 2) && safetyCounter < 10000) { 
    const targetIndex = Math.floor(Math.random() * segments.length);
    const targetSegment = segments[targetIndex];
    
    // Only add remainder if it doesn't break the secret rule (unless we have no choice)
    if (targetSegment.finalValue < MAX_REALISTIC_USAGE || safetyCounter > 5000) {
        targetSegment.finalValue = parseFloat((targetSegment.finalValue + step).toFixed(precision));
        remainder -= step;
    }
    safetyCounter++;
  }

  // 5. Construct Results
  const results: CalculationResult[] = [];
  let runningTotal = startMeter;
  const avgUsage = totalDiff / divisions;

  segments.forEach((seg, index) => {
    runningTotal += seg.finalValue;
    
    // Peak detection logic
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

  // Final sanity check for cumulative total
  if (results.length > 0) {
    const last = results[results.length - 1];
    const diff = endMeter - last.cumulative;
    if (Math.abs(diff) > (step / 10)) {
       last.cumulative = endMeter;
       last.value = parseFloat((last.value + diff).toFixed(precision));
    }
  }

  return results;
};

export const formatNumber = (num: number, precision: number = 1): string => {
  return num.toFixed(precision);
};
