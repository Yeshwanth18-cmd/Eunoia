import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "system-config.json");

// Ensure data dir exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
    fs.mkdirSync(path.join(process.cwd(), "data"));
}

function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        return { voiceEnabled: true }; // Default
    }
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    try {
        return JSON.parse(data);
    } catch {
        return { voiceEnabled: true };
    }
}

export async function GET() {
    const config = getConfig();
    return NextResponse.json(config);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const current = getConfig();
        const newConfig = { ...current, ...body };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));

        return NextResponse.json(newConfig);
    } catch (error) {
        console.error("Config Save Error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
