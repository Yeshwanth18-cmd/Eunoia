import { getResourceContent } from "@/lib/resources";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Force dynamic rendering if file changes matter, or static if cached.
export const dynamic = 'force-dynamic';

export default async function ResourcePage({ params }: { params: { slug: string } }) {
    const resource = await getResourceContent(params.slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 relative overflow-hidden font-heading">
            {/* EXECUTIVE VIGNETTE */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-vignette-light dark:bg-vignette-dark" />

            {/* Background Ambience */}
            <div className="fixed top-0 right-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Nav */}
                <div className="mb-8">
                    <Link href="/community" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        ← Back to Community
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-10 pb-10 border-b border-border/50">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-foreground leading-tight">
                        {resource.frontmatter.title || "Resource"}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="px-3 py-1 rounded-full bg-surface-hover border border-border text-xs font-bold uppercase tracking-wider text-foreground">
                            Guide
                        </span>
                        <span className="font-medium">5 min read</span>
                    </div>
                </header>

                {/* Content */}
                <article className="prose prose-neutral dark:prose-invert prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                    prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-medium
                    prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-black
                    prose-blockquote:border-l-primary/50 prose-blockquote:bg-surface-hover/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:not-italic
                    prose-li:text-muted-foreground prose-li:marker:text-primary/50">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {resource.content}
                    </ReactMarkdown>
                </article>

                {/* Footer */}
                <div className="mt-16 pt-10 border-t border-border/50 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left bg-surface-card border border-border p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                    <div>
                        <h3 className="text-lg font-black text-foreground mb-1">Need to talk?</h3>
                        <p className="text-muted-foreground text-sm font-medium group-hover:text-foreground transition-colors">Our counselors are here to listen.</p>
                    </div>
                    <Link
                        href="/booking"
                        className="px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:scale-105 transition-transform shadow-lg hover:shadow-xl uppercase tracking-wider text-xs"
                    >
                        Book a Session
                    </Link>
                </div>
            </div>
        </div>
    );
}
