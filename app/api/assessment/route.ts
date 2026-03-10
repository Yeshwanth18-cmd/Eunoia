import { NextRequest, NextResponse } from "next/server";
import {
    getSeverityForAssessment,
    type AssessmentType,
} from "@/lib/assessmentConfig";
import { logEvent } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const body = await req.json();

        const requestedType = (body.assessmentType || body.type) as AssessmentType;
        const assessmentType: AssessmentType = ["PHQ9", "GAD7", "PSS", "UCLA", "PSWQ"].includes(requestedType)
            ? requestedType
            : "PHQ9";

        // Parse answers
        let answers: number[] = [];
        if (Array.isArray(body.answers)) {
            answers = body.answers.map((v: unknown) => Number(v) || 0);
        } else {
            // Fallback
            for (let i = 1; i <= 20; i++) { // Increased range for safety
                const val = body[`q${i}`];
                if (val !== undefined) answers.push(Number(val) || 0);
            }
        }

        // Calculate Total Score (Handle special logic like PSS/PSWQ/UCLA reverse scoring)
        // Assume input `answers` are 0-based indices from the UI (0,1,2,3,4)
        // Adjust if scales differ (PSWQ is usually 1-5, but we treat input as 0-4 and add 1 if needed, or just normalize to range)

        let totalScore = 0;

        if (assessmentType === "PSS") {
            // PSS-10 Reverse Scoring: Items 4, 5, 7, 8 (Indices 3, 4, 6, 7)
            // Scale 0-4. Reverse: 4-val.
            totalScore = answers.reduce((sum, val, idx) => {
                if ([3, 4, 6, 7].includes(idx)) {
                    return sum + (4 - val);
                }
                return sum + val;
            }, 0);
        } else if (assessmentType === "PSWQ") {
            // PSWQ Reverse Scoring: Items 1, 3, 8, 10, 11 (Indices 0, 2, 7, 9, 10)
            // Scale 0-4. Reverse: 4-val.
            totalScore = answers.reduce((sum, val, idx) => {
                if ([0, 2, 7, 9, 10].includes(idx)) {
                    return sum + (4 - val);
                }
                return sum + val;
            }, 0);
        } else if (assessmentType === "UCLA") {
            // UCLA-8 Reverse Scoring: Item 6 (Index 5) ("I can find companionship when I want it")
            // Scale 0-3. Reverse: 3-val.
            totalScore = answers.reduce((sum, val, idx) => {
                if (idx === 5) { // Question 6
                    return sum + (3 - val);
                }
                return sum + val;
            }, 0);
        } else {
            // Standard Sum (PHQ9, GAD7)
            totalScore = answers.reduce((sum, val) => sum + val, 0);
        }

        const severity = getSeverityForAssessment(assessmentType, totalScore);

        // Save to DB
        await prisma.assessment.create({
            data: {
                userId: session ? session.userId : null,
                anonymousId: session ? null : body.userId,
                assessmentType,
                totalScore,
                severity,
                rawAnswers: JSON.stringify(answers),
            },
        });

        logEvent("assessment_submitted", { totalScore, severity, assessmentType });

        return NextResponse.json({ totalScore, severity, assessmentType });
    } catch (error) {
        console.error("Assessment Error", error);
        return NextResponse.json(
            { error: "Failed to submit assessment" },
            { status: 500 }
        );
    }
}
