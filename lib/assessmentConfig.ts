export type AssessmentType = "PHQ9" | "GAD7" | "PSS" | "UCLA" | "PSWQ";

export type AssessmentQuestion = {
    id: string;
    text: string;
};

// PHQ-9 (Depression) - 9 Items
export const PHQ9_QUESTIONS: AssessmentQuestion[] = [
    { id: "q1", text: "Little interest or pleasure in doing things" },
    { id: "q2", text: "Feeling down, depressed, or hopeless" },
    { id: "q3", text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: "q4", text: "Feeling tired or having little energy" },
    { id: "q5", text: "Poor appetite or overeating" },
    { id: "q6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
    { id: "q7", text: "Trouble concentrating on things, such as reading or watching TV" },
    { id: "q8", text: "Moving or speaking so slowly that other people could have noticed, or the opposite — being fidgety or restless" },
    { id: "q9", text: "Thoughts that you would be better off dead, or of hurting yourself" },
];

// GAD-7 (Anxiety) - 7 Items
export const GAD7_QUESTIONS: AssessmentQuestion[] = [
    { id: "g1", text: "Feeling nervous, anxious, or on edge" },
    { id: "g2", text: "Not being able to stop or control worrying" },
    { id: "g3", text: "Worrying too much about different things" },
    { id: "g4", text: "Trouble relaxing" },
    { id: "g5", text: "Being so restless that it is hard to sit still" },
    { id: "g6", text: "Becoming easily annoyed or irritable" },
    { id: "g7", text: "Feeling afraid as if something awful might happen" },
];

/**
 * PSS-10 (Perceived Stress Scale - Full 10 Item)
 * Scale: 0 (Never) to 4 (Very Often)
 * Reverse Scored Items: 4, 5, 7, 8 (Indices: 3, 4, 6, 7)
 */
export const PSS_QUESTIONS: AssessmentQuestion[] = [
    { id: "p1", text: "In the last month, how often have you been upset because of something that happened unexpectedly?" },
    { id: "p2", text: "In the last month, how often have you felt that you were unable to control the important things in your life?" },
    { id: "p3", text: "In the last month, how often have you felt nervous and \"stressed\"?" },
    { id: "p4", text: "In the last month, how often have you felt confident about your ability to handle your personal problems?" }, // Reverse
    { id: "p5", text: "In the last month, how often have you felt that things were going your way?" }, // Reverse
    { id: "p6", text: "In the last month, how often have you found that you could not cope with all the things that you had to do?" },
    { id: "p7", text: "In the last month, how often have you been able to control irritations in your life?" }, // Reverse
    { id: "p8", text: "In the last month, how often have you felt that you were on top of things?" }, // Reverse
    { id: "p9", text: "In the last month, how often have you been angered because of things that happened that were outside of your control?" },
    { id: "p10", text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?" }
];

/**
 * UCLA Loneliness Scale (ULS-8)
 * Scale: 0 (Never) to 3 (Often) - Mapped from 1-4 standard usually, but we use 0-3 for consistency across app.
 * No reverse scoring in standard short form usually, but some variants do. 
 * We will use the standard 8 negative items for simplicity in scoring unless specified.
 * Actually, standard ULS-8 usually has mixed items. 
 * Let's use the explicit "I feel" version.
 */
export const UCLA_QUESTIONS: AssessmentQuestion[] = [
    { id: "u1", text: "I lack companionship." },
    { id: "u2", text: "There is no one I can turn to." },
    { id: "u3", text: "I am an outgoing person." }, // Reverse? Usually items are: "I lack companionship", "There is no one I can turn to", "I am alone", "I feel left out", "I feel isolated", "I can find companionship when I want it" (Reverse), "I am unhappy being so withdrawn", "People are around me but not with me".
    // Let's stick to the 8-item version from NIH/Standard.
    // 1. "I lack companionship"
    // 2. "There is no one I can turn to"
    // 3. "I am alone"
    // 4. "I feel left out"
    // 5. "I feel isolated from others"
    // 6. "I can find companionship when I want it" (Reverse)
    // 7. "I am unhappy being so withdrawn"
    // 8. "People are around me but not with me"
    // Let's use a simpler set without reverse scoring for clarity if possible, or handle it.
    // Okay, let's implement the specific 8 items found in research.
    { id: "u1", text: "I lack companionship." },
    { id: "u2", text: "There is no one I can turn to." },
    { id: "u3", text: "I am alone." },
    { id: "u4", text: "I feel left out." },
    { id: "u5", text: "I feel isolated from others." },
    { id: "u6", text: "I can find companionship when I want it." }, // Reverse
    { id: "u7", text: "I am unhappy being so withdrawn." },
    { id: "u8", text: "People are around me but not with me." }
];

/**
 * PSWQ (Penn State Worry Questionnaire) - 16 Items
 * Scale: 1 (Not at all typical) to 5 (Very typical). 
 * We map 0-4 for UI consistency.
 * Reverse Scored Items: 1, 3, 8, 10, 11
 */
export const PSWQ_QUESTIONS: AssessmentQuestion[] = [
    { id: "w1", text: "If I do not have enough time to do everything, I do not worry about it." }, // Reverse
    { id: "w2", text: "My worries overwhelm me." },
    { id: "w3", text: "I do not tend to worry about things." }, // Reverse
    { id: "w4", text: "Many situations make me worry." },
    { id: "w5", text: "I know I should not worry about things, but I just cannot help it." },
    { id: "w6", text: "When I am under pressure I worry a lot." },
    { id: "w7", text: "I am always worrying about something." },
    { id: "w8", text: "I find it easy to dismiss worrisome thoughts." }, // Reverse
    { id: "w9", text: "As soon as I finish one task, I start to worry about everything else I have to do." },
    { id: "w10", text: "I never worry about anything." }, // Reverse
    { id: "w11", text: "When there is nothing more I can do about a concern, I do not worry about it any more." }, // Reverse
    { id: "w12", text: "I have been a worrier all my life." },
    { id: "w13", text: "I notice that I have been worrying about things." },
    { id: "w14", text: "Once I start worrying, I cannot stop." },
    { id: "w15", text: "I worry all the time." },
    { id: "w16", text: "I worry about projects until they are done." }
];


// --- Scoring Logic ---

export function getPhq9Severity(score: number): string {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Moderately Severe";
    return "Severe";
}

export function getGad7Severity(score: number): string {
    if (score <= 4) return "Minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    return "Severe";
}

// PSS-10: 0-40 range.
// 0-13: Low Stress
// 14-26: Moderate Stress
// 27-40: High Stress
export function getPssSeverity(score: number): string {
    if (score <= 13) return "Low Stress";
    if (score <= 26) return "Moderate Stress";
    return "High Stress";
}

// UCLA-8: Range 0-24 (if 0-3 scale).
// Cutoffs vary. 
export function getUclaSeverity(score: number): string {
    if (score <= 12) return "Low Loneliness"; // Arbitrary half-way? Need calibration.
    if (score <= 18) return "Moderate Loneliness";
    return "High Loneliness";
}

// PSWQ: Range 16-80 (if 1-5 scale). We use 0-4 -> Range 0-64.
// Clinical cutoff usually around 45-50 (on 16-80 scale) => ~29-34 on 0-64 scale.
export function getPswqSeverity(score: number): string {
    // Adjusted for 0-4 input scale
    if (score <= 29) return "Low Worry";
    if (score <= 45) return "Moderate Worry";
    return "High Worry";
}

export function getSeverityForAssessment(
    assessmentType: AssessmentType,
    totalScore: number
): string {
    switch (assessmentType) {
        case "GAD7": return getGad7Severity(totalScore);
        case "PSS": return getPssSeverity(totalScore);
        case "UCLA": return getUclaSeverity(totalScore);
        case "PSWQ": return getPswqSeverity(totalScore);
        case "PHQ9":
        default: return getPhq9Severity(totalScore);
    }
}
