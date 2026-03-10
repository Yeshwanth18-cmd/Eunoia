import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to ensure array response even if DB fails
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch(modelName: any, query: any) {
    try {
        return await modelName.findMany(query);
    } catch (e) {
        console.warn(`Failed to export ${modelName}`, e);
        return [];
    }
}

import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const anonymousId = searchParams.get('anonymousId');
    const session = await getSession();

    if (!anonymousId && !session) {
        return NextResponse.json({ error: 'ID or Session required' }, { status: 400 });
    }

    // Build Query Clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = { OR: [] };
    if (anonymousId) whereClause.OR.push({ anonymousId });
    if (session?.userId) whereClause.OR.push({ userId: session.userId });

    // Fallback if no valid IDs found (shouldn't happen given check above)
    if (whereClause.OR.length === 0) return NextResponse.json({ error: 'No user context found' }, { status: 400 });

    try {
        // Fetch all data points in parallel
        // Only fetch what we use
        const [assessments, moodLogs, journalEntries] = await Promise.all([
            safeFetch(prisma.assessment, { where: whereClause }),
            safeFetch(prisma.moodLog, { where: whereClause }),
            // safeFetch(prisma.experientialLog, { where: whereClause }), // Unused
            // safeFetch(prisma.capacityLog, { where: whereClause }), // Unused
            safeFetch(prisma.journalEntry, { where: whereClause })
        ]);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eunoia Data Export</title>
    <style>
        :root {
            --bg: #f8fafc;
            --surface: #ffffff;
            --border: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #4f46e5;
            --primary-light: #e0e7ff;
            --accent: #8b5cf6;
            --scroll-thumb: #cbd5e1;
        }
        [data-theme="dark"] {
            --bg: #0f172a;
            --surface: #1e293b;
            --border: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #818cf8;
            --primary-light: #1e293b;
            --accent: #a78bfa;
            --scroll-thumb: #475569;
        }
        * { box-sizing: border-box; transition: background-color 0.3s, color 0.3s; }
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        /* Header */
        header {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1);
        }
        h1 { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--primary); letter-spacing: -0.02em; }
        .theme-toggle {
            background: none; border: 1px solid var(--border);
            padding: 0.5rem 1rem; border-radius: 999px;
            cursor: pointer; color: var(--text-main); font-weight: 600;
            display: flex; align-items: center; gap: 0.5rem;
        }
        .theme-toggle:hover { background: var(--bg); }

        /* Main Grid */
        main {
            flex: 1;
            padding: 1.5rem;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: 1fr;
            gap: 1.5rem;
            overflow: hidden;
            max-width: 1600px;
            margin: 0 auto;
            width: 100%;
        }

        @media (max-width: 1024px) {
            main { grid-template-columns: 1fr; grid-template-rows: auto; overflow-y: auto; display: block; }
            .section-col { height: 500px !important; margin-bottom: 2rem; }
        }

        /* Badge */
        .badge {
            background: var(--primary);
            color: #ffffff;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            margin-left: 0.5rem;
            vertical-align: middle;
        }

        /* Columns */
        .section-col {
            background: var(--surface);
            border-radius: 1.5rem;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }
        .col-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            flex-shrink: 0;
            background: var(--surface);
            position: sticky; top: 0;
            z-index: 10;
        }
        .col-header h2 { margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .col-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
        }

        /* Scrollbar */
        .col-content::-webkit-scrollbar { width: 8px; }
        .col-content::-webkit-scrollbar-track { background: transparent; }
        .col-content::-webkit-scrollbar-thumb { background-color: var(--scroll-thumb); border-radius: 4px; }

        /* Cards */
        .item-card {
            background: var(--bg);
            border: 1px solid var(--border);
            padding: 1.25rem;
            border-radius: 1rem;
            margin-bottom: 1rem;
            position: relative;
        }
        .item-card:last-child { margin-bottom: 0; }
        .meta { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.5rem; display: flex; justify-content: space-between; }
        .item-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem 0; color: var(--text-main); }
        .item-body { font-size: 0.9rem; color: var(--text-main); opacity: 0.9; white-space: pre-wrap; }
        .tag { background: var(--primary-light); color: var(--primary); padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
        
        .mood-emoji { font-size: 2rem; }
    </style>
</head>
<body>
    <header>
        <div>
            <h1>Eunoia Data Export</h1>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Generated on ${new Date().toLocaleString()}</div>
        </div>
        <button class="theme-toggle" onclick="toggleTheme()">
            <span id="theme-icon">🌙</span> <span>Toggle Theme</span>
        </button>
    </header>

    <main>
        <!-- Journal Column -->
        <section class="section-col">
            <div class="col-header">
                <h2>📝 Journal <span class="badge">${journalEntries.length}</span></h2>
            </div>
            <div class="col-content">
                ${journalEntries.length === 0 ? '<div style="text-align:center; color: var(--text-muted); padding: 2rem;">No entries found.</div>' : journalEntries.map((j: { createdAt: Date, title: string, content: string, prompt?: string }) => `
                    <div class="item-card">
                        <div class="meta">
                            <span>${new Date(j.createdAt).toLocaleDateString()}</span>
                            <span>${new Date(j.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h3 class="item-title">${j.title || "Untitled"}</h3>
                        <div class="item-body">${j.content}</div>
                        ${j.prompt ? `<div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px dashed var(--border); font-size:0.8rem; color:var(--text-muted);"><em>${j.prompt}</em></div>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Assessments Column -->
        <section class="section-col">
            <div class="col-header">
                <h2>🧠 Assessments <span class="badge">${assessments.length}</span></h2>
            </div>
            <div class="col-content">
                ${assessments.length === 0 ? '<div style="text-align:center; color: var(--text-muted); padding: 2rem;">No assessments found.</div>' : assessments.map((a: { createdAt: Date, assessmentType: string, totalScore: number, severity: string }) => `
                    <div class="item-card">
                        <div class="meta">
                            <span>${new Date(a.createdAt).toLocaleDateString()}</span>
                            <span class="tag">${a.assessmentType}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                            <div>
                                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Score</div>
                                <div style="font-size:1.5rem; font-weight:800; color:var(--primary);">${a.totalScore}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Result</div>
                                <div style="font-weight:700;">${a.severity}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Moods Column -->
        <section class="section-col">
            <div class="col-header">
                <h2>☁️ Mood Log <span class="badge">${moodLogs.length}</span></h2>
            </div>
            <div class="col-content">
                ${moodLogs.length === 0 ? '<div style="text-align:center; color: var(--text-muted); padding: 2rem;">No logs found.</div>' : moodLogs.map((m: { mood: number, createdAt: Date, note?: string }) => `
                    <div class="item-card" style="display:flex; align-items:center; gap:1rem;">
                        <div class="mood-emoji">${["", "😫", "😕", "😐", "🙂", "🤩"][m.mood] || "❓"}</div>
                        <div style="flex:1;">
                            <div class="meta" style="margin-bottom:0.25rem;">${new Date(m.createdAt).toLocaleString()}</div>
                            <div class="item-body">${m.note || "No note."}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    </main>

    <script>
        function toggleTheme() {
            const body = document.body;
            const current = body.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', next);
            document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
        }
        
        // Auto-detect
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('theme-icon').textContent = '☀️';
        }
    </script>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `attachment; filename="eunoia-export-${new Date().toISOString().split('T')[0]}.html"`
            }
        });

    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
