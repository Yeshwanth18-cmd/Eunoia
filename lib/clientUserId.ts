let cachedId: string | null = null;

function generateId() {
    return "user_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateClientUserId(): string {
    if (typeof window === "undefined") {
        return "anonymous";
    }

    if (cachedId) return cachedId;

    // Check for the ID used by Community Page first
    const legacyId = window.localStorage.getItem("eunoia_anonymous_id");
    if (legacyId && typeof legacyId === "string") {
        // Migrate or valid adoption
        // If we want to standardise on eunoia_user_id, we could set it too, 
        // but let's stick to reading the one that has data (Community Page one).
        cachedId = legacyId;
        // Optionally sync it to the new key if we want to migrate forward
        window.localStorage.setItem("eunoia_user_id", legacyId);
        return legacyId;
    }

    // Check for the new ID
    const existing = window.localStorage.getItem("eunoia_user_id");
    if (existing && typeof existing === "string") {
        cachedId = existing;
        return existing;
    }

    // Create new
    const next = generateId();
    window.localStorage.setItem("eunoia_user_id", next);
    // Also set the legacy one so CommunityPage picks it up if it uses logic directly
    window.localStorage.setItem("eunoia_anonymous_id", next);

    cachedId = next;
    return next;
}
