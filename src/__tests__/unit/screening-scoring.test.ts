import { calculateToddlerScore, calculateChildScore } from '@/app/screening/scoring';

describe('Screening Scoring Logic', () => {
    describe('calculateChildScore', () => {
        it('should calculate High Risk score (all Yes)', () => {
            const answers = Array(20).fill('yes');
            const result = calculateChildScore(answers);

            expect(result.score).toBe(100);
            expect(result.category).toBe('High');
            expect(result.rawScore).toBe(20);
            expect(result.maxScore).toBe(20);
            expect(result.group).toBe('child');
            expect(result.interpretation).toContain('Higher concern level');
        });

        it('should calculate Low Risk score (all No)', () => {
            const answers = Array(20).fill('no');
            const result = calculateChildScore(answers);

            expect(result.score).toBe(0);
            expect(result.category).toBe('Low');
            expect(result.rawScore).toBe(0);
            expect(result.interpretation).toContain('Low concern level');
        });

        it('should calculate Moderate Risk score (5/20 yes = 25%)', () => {
            const answers = [
                'yes', 'yes', 'yes', 'yes', 'yes', // 5 yes
                'no', 'no', 'no', 'no', 'no',
                'no', 'no', 'no', 'no', 'no',
                'no', 'no', 'no', 'no', 'no',
            ];
            const result = calculateChildScore(answers);

            expect(result.score).toBe(25);
            expect(result.category).toBe('Moderate');
            expect(result.rawScore).toBe(5);
            expect(result.interpretation).toContain('Moderate concern level');
        });

        it('should calculate High Risk threshold (10/20 yes = 50%)', () => {
            const answers = [
                'yes', 'yes', 'yes', 'yes', 'yes',
                'yes', 'yes', 'yes', 'yes', 'yes', // 10 yes
                'no', 'no', 'no', 'no', 'no',
                'no', 'no', 'no', 'no', 'no',
            ];
            const result = calculateChildScore(answers);

            expect(result.score).toBe(50);
            expect(result.category).toBe('High');
        });
    });

    describe('calculateToddlerScore', () => {
        it('should calculate High Risk score with reverse scoring', () => {
            // Q2, Q5, Q12 are reverse scored (indices 1, 4, 11)
            // All "No" for normal + All "Yes" for reverse = highest risk
            const answers = [
                'no',  // Q1 (normal) - risk point
                'yes', // Q2 (reverse) - risk point
                'no',  // Q3 (normal) - risk point
                'no',  // Q4 (normal) - risk point
                'yes', // Q5 (reverse) - risk point
                'no',  // Q6 (normal) - risk point
                'no',  // Q7 (normal) - risk point
                'no',  // Q8 (normal) - risk point
                'no',  // Q9 (normal) - risk point
                'no',  // Q10 (normal) - risk point
                'no',  // Q11 (normal) - risk point
                'yes', // Q12 (reverse) - risk point
                'no',  // Q13 (normal) - risk point
                'no',  // Q14 (normal) - risk point
                'no',  // Q15 (normal) - risk point
                'no',  // Q16 (normal) - risk point
                'no',  // Q17 (normal) - risk point
                'no',  // Q18 (normal) - risk point
                'no',  // Q19 (normal) - risk point
                'no',  // Q20 (normal) - risk point
            ];
            const result = calculateToddlerScore(answers);

            expect(result.rawScore).toBe(20); // All items scored as risk
            expect(result.category).toBe('High');
            expect(result.interpretation).toContain('High risk');
        });

        it('should calculate Moderate Risk score (3 points)', () => {
            const answers = [
                'yes', // Q1 (normal) - safe
                'yes', // Q2 (reverse) - RISK
                'no',  // Q3 (normal) - RISK
                'no',  // Q4 (normal) - RISK
                'no',  // Q5 (reverse) - safe
                'yes', 'yes', 'yes', 'yes', 'yes',
                'yes', 'no', 'yes', 'yes', 'yes',
                'yes', 'yes', 'yes', 'yes', 'yes',
            ];
            const result = calculateToddlerScore(answers);

            expect(result.rawScore).toBe(3);
            expect(result.category).toBe('Moderate');
            expect(result.interpretation).toContain('Moderate risk');
        });

        it('should calculate Low Risk score (all safe answers)', () => {
            const answers = [
                'yes', // Q1 (normal) - safe
                'no',  // Q2 (reverse) - safe
                'yes', 'yes',
                'no',  // Q5 (reverse) - safe
                'yes', 'yes', 'yes', 'yes', 'yes',
                'yes',
                'no',  // Q12 (reverse) - safe
                'yes', 'yes', 'yes',
                'yes', 'yes', 'yes', 'yes', 'yes',
            ];
            const result = calculateToddlerScore(answers);

            expect(result.rawScore).toBe(0);
            expect(result.category).toBe('Low');
            expect(result.interpretation).toContain('Low risk');
        });

        it('should handle High Risk threshold (8+ points)', () => {
            const answers = [
                'no', 'yes', 'no', 'no', 'yes', // 4 risk points
                'no', 'no', 'no', 'no', 'no',   // 5 more = 9 total
                'yes', 'yes', 'yes', 'yes', 'yes',
                'yes', 'yes', 'yes', 'yes', 'yes',
            ];
            const result = calculateToddlerScore(answers);

            expect(result.rawScore).toBeGreaterThanOrEqual(8);
            expect(result.category).toBe('High');
        });
    });
});
