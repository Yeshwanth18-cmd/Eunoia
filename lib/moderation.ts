

// Simple keyword-based moderation for prototype
// In production, replace this with OpenAI Moderation API call
const FLAGGED_KEYWORDS = [
    "die", "kill", "suicide", "hurt myself", "end it all",
    "stupid", "idiot", "hate", "ugly", "fat",
    "murder", "terrorist", "bomb"
];

export async function checkContent(text: string): Promise<boolean> {
    const lowerText = text.toLowerCase();
    return FLAGGED_KEYWORDS.some(keyword => lowerText.includes(keyword));
}
