/**
 * Smart Estimation Logic - Corporate Grade
 * Handles fluctuating water usage patterns with robust distribution,
 * specific time-based constraints, and a learning engine.
 */

export interface CalculationResult {
  id: number;
  label: string;
  hourLabel: string;
  value: number;
  cumulative: number;
  isPeak: boolean;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  status: 'low' | 'normal' | 'high' | 'peak';
  intensity: number;
  targetRange: string; // For verification
}

export type UsageProfile = 'residential' | 'commercial' | 'flat';

// Specific constraints as requested
// Mapping hours to [Min, Max]
const SPECIFIC_RANGES: Record<number, [number, number]> = {
  5: [15, 28],  // 05:30
  6: [15, 29],  // 06:30
  11: [34, 52], // 11:30 (Peak)
  12: [34, 52], // 12:30 (Peak)
  15: [22, 36], // 15:30
  16: [22, 36], // 16:30
};

// Default fallbacks for unconstrained hours
const DEFAULT_DAY_RANGE: [number, number] = [10, 25];
const DEFAULT_NIGHT_RANGE: [number, number] = [2, 8];

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Smart Learning: Get usage count from storage
const getLearningFactor = (): number => {
  try {
    const count = parseInt(localStorage.getItem('usage_count') || '0', 10);
    // Factor 0 to 1. 0 = purely random within range. 1 = highly precise (center of range).
    // Cap at 50 uses for max precision to allow some variability.
    return Math.min(count / 50, 0.9); 
  } catch {
    return 0;
  }
};

const incrementUsage = () => {
  try {
    const count = parseInt(localStorage.getItem('usage_count') || '0', 10);
    localStorage.setItem('usage_count', (count + 1).toString());
  } catch {}
};

export const distributeValue = (
  startMeter: number,
  endMeter: number,
  divisions: number,
  startHour: number = 8,
  profile: UsageProfile = 'residential',
  precision: number = 1
): CalculationResult[] => {
  
  // 1. Validation
  if (isNaN(startMeter) || isNaN(endMeter) || isNaN(divisions)) return [];
  if (divisions <= 0) return [];
  
  // STRICT RULE: End must be > Start. 
  if (endMeter < startMeter) return [];

  const totalDiff = endMeter - startMeter;
  const learningFactor = getLearningFactor();
  incrementUsage(); // Learn from this interaction

  // If no difference, return flat zero
  if (totalDiff <= 0) {
      return Array.from({ length: divisions }, (_, i) => ({
          id: i + 1,
          label: `Period ${i + 1}`,
          hourLabel: `${String((startHour + i) % 24).padStart(2, '0')}:00`,
          value: 0,
          cumulative: startMeter,
          isPeak: false,
          percentage: 0,
          trend: 'stable',
          status: 'low',
          intensity: 0,
          targetRange: '-'
      }));
  }

  const factor = Math.pow(10, precision);

  // 2. Generate Weighted Segments based on Constraints
  let segments = [];
  let totalWeight = 0;

  for (let i = 0; i < divisions; i++) {
    const currentHour = (startHour + i) % 24;
    let min, max;
    let isPeak = false;
    let isConstrained = false;

    // Determine Range
    if (SPECIFIC_RANGES[currentHour]) {
      [min, max] = SPECIFIC_RANGES[currentHour];
      isConstrained = true;
      if (currentHour === 11 || currentHour === 12) isPeak = true;
    } else {
      // General logic for other hours
      if (currentHour >= 22 || currentHour <= 4) {
        [min, max] = DEFAULT_NIGHT_RANGE;
      } else {
        [min, max] = DEFAULT_DAY_RANGE;
      }
    }

    // Smart Generation based on Profile
    const center = (min + max) / 2;
    const rangeSpan = (max - min) / 2;
    const effectiveSpan = rangeSpan * (1 - learningFactor * 0.6); // Shrink range as we learn
    
    let rawWeight;

    if (profile === 'flat') {
        // Flat Profile:
        // If constrained, stick to the center of the constraint.
        // If unconstrained, use a fixed base value (we'll normalize later).
        if (isConstrained) {
            rawWeight = center; 
        } else {
            // For unconstrained hours in 'flat' mode, we want them to be even.
            // We use a neutral weight (e.g., average of day/night range centers)
            rawWeight = 15; // Arbitrary base, will be normalized by totalDiff
        }
    } else {
        // Residential / Commercial:
        // Use random fluctuation
        rawWeight = randomInRange(center - effectiveSpan, center + effectiveSpan);
    }

    segments.push({ 
        originalIndex: i,
        hour: currentHour, 
        weight: rawWeight, 
        min, max, 
        isConstrained,
        finalValue: 0, 
        isPeak, 
        fractionalPart: 0 
    });
  }

  // 3. Smoothing & Balancing (The "Smart" Logic)
  
  // Only apply smoothing for non-flat profiles to keep 'flat' truly flat where possible
  if (profile !== 'flat') {
      // A. Smooth Transitions
      for (let i = 1; i < segments.length; i++) {
        const prev = segments[i-1];
        const curr = segments[i];

        if (!curr.isConstrained || !prev.isConstrained) {
            const diff = Math.abs(curr.weight - prev.weight);
            const avg = (curr.weight + prev.weight) / 2;
            
            if (diff > avg * 0.5) {
                curr.weight = curr.weight * 0.7 + avg * 0.3;
                prev.weight = prev.weight * 0.7 + avg * 0.3;
            }
        }
      }

      // B. 2-Hour Block Balancing
      for (let i = 0; i < segments.length - 1; i += 2) {
          const s1 = segments[i];
          const s2 = segments[i+1];
          
          if (s1.isPeak === s2.isPeak) {
              const sum = s1.weight + s2.weight;
              const ratio = s1.weight / sum;
              
              if (ratio < 0.35 || ratio > 0.65) {
                  const target = sum / 2;
                  s1.weight = s1.weight * 0.5 + target * 0.5;
                  s2.weight = s2.weight * 0.5 + target * 0.5;
              }
          }
      }
  }

  // Recalculate total weight
  totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);

  // 4. Distribute Values (Largest Remainder Method)
  let currentSum = 0;
  
  segments.forEach(seg => {
      // Calculate share
      const idealValue = (seg.weight / totalWeight) * totalDiff;
      
      // Round down to precision
      const steps = idealValue * factor;
      const flooredSteps = Math.floor(steps);
      
      seg.finalValue = flooredSteps / factor;
      seg.fractionalPart = steps - flooredSteps;
      currentSum += seg.finalValue;
  });

  // Distribute remainder
  let missingValue = totalDiff - currentSum;
  missingValue = parseFloat(missingValue.toFixed(precision));
  
  let stepsToAdd = Math.round(missingValue * factor);
  const stepSize = 1 / factor;

  // Sort by fractional part
  const sortedSegments = [...segments].sort((a, b) => b.fractionalPart - a.fractionalPart);

  for (let i = 0; i < stepsToAdd; i++) {
      const seg = sortedSegments[i % sortedSegments.length];
      seg.finalValue = parseFloat((seg.finalValue + stepSize).toFixed(precision));
  }

  // 5. Build Final Results
  const results: CalculationResult[] = [];
  let runningTotal = startMeter;
  let maxVal = Math.max(...segments.map(s => s.finalValue)) || 1;

  // Re-sort to original time order
  segments.forEach((seg, index) => {
      runningTotal += seg.finalValue;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (index > 0) {
          const prev = segments[index - 1].finalValue;
          if (seg.finalValue > prev * 1.05) trend = 'up';
          else if (seg.finalValue < prev * 0.95) trend = 'down';
      }

      const ratio = seg.finalValue / (totalDiff / divisions);
      let status: 'low' | 'normal' | 'high' | 'peak' = 'normal';
      if (seg.isPeak || ratio > 1.6) status = 'peak';
      else if (ratio > 1.2) status = 'high';
      else if (ratio < 0.6) status = 'low';

      results.push({
          id: index + 1,
          label: `Period ${index + 1}`,
          hourLabel: `${String(seg.hour).padStart(2, '0')}:00`,
          value: seg.finalValue,
          cumulative: parseFloat(runningTotal.toFixed(precision)),
          isPeak: seg.isPeak,
          percentage: (seg.finalValue / totalDiff) * 100,
          trend,
          status,
          intensity: (seg.finalValue / maxVal) * 100,
          targetRange: seg.isConstrained ? `${seg.min}-${seg.max}` : '-'
      });
  });

  // Force exact end match visually
  if (results.length > 0) {
      results[results.length - 1].cumulative = endMeter;
  }

  return results;
};

export const formatNumber = (num: number, precision: number = 1): string => num.toFixed(precision);
