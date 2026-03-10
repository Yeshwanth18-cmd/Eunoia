import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET || "student-secret-key-change-me";

// --- Native Zero-Dependency JWT Implementation ---
// (Replaced 'jose' to fix Vercel build)

function base64UrlEncode(str: string): string {
    return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return Buffer.from(str, "base64").toString();
}

function signJwt(payload: object): string {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = base64UrlEncode(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 })); // 24h exp

    const signature = createHmac("sha256", SECRET_KEY)
        .update(`${header}.${body}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string): { userId: string } | null {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expectedSignature = createHmac("sha256", SECRET_KEY)
        .update(`${header}.${body}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // Constant-time comparison to prevent timing attacks
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(body));
        if (Date.now() > payload.exp) return null; // Expired
        return payload as { userId: string };
    } catch {
        return null;
    }
}

// --- Auth Helpers ---

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    // Check if it's a bcrypt hash (starts with $2)
    if (hashed.startsWith("$2")) {
        return await bcrypt.compare(plain, hashed);
    }

    // Legacy HMAC-SHA256 fallback
    const legacyHash = createHmac('sha256', SECRET_KEY).update(plain).digest('hex');
    return legacyHash === hashed;
}

export async function createSession(userId: string) {
    const token = signJwt({ userId });

    cookies().set("student_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });
}

export async function getSession() {
    const token = cookies().get("student_session")?.value;
    if (!token) return null;
    return verifyJwt(token);
}

export async function clearSession() {
    cookies().delete("student_session");
}
