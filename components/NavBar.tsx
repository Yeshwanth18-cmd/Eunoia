"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Check-in' },
    { href: '/booking', label: 'Consult' },
    { href: '/community', label: 'Support' },
    { href: '/profile', label: 'Profile' },
];

export function NavBar({ user }: { user?: { name?: string } | null }) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4">

                {/* Logo Area */}
                <Link href="/" className="group flex items-center gap-3 relative">
                    <div className="relative h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-lg shadow-sm border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                        E
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground font-heading group-hover:text-primary transition-colors duration-300">
                        Eunoia
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-surface-card border border-border shadow-sm">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href !== '/' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                    ? "text-primary-foreground bg-primary shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-9 w-9 rounded-full bg-surface-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === "dark" ? "🌙" : "☀️"}
                        </button>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                Hi, <span className="text-foreground font-bold">{user.name || 'Student'}</span>
                            </span>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/student-logout', { method: 'POST' });
                                    window.location.href = '/login';
                                }}
                                className="px-4 py-2 rounded-full text-xs font-bold bg-surface-card text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-border hover:border-red-500/20"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="px-5 py-2 rounded-full text-xs font-bold bg-foreground text-background hover:opacity-90 transition-all shadow-md">
                            Log In
                        </Link>
                    )}

                    {/* Admin Access Anchor */}
                    <Link
                        href="/admin"
                        className="h-9 w-9 rounded-full bg-surface-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface-hover transition-all group relative"
                        title="Admin Access"
                    >
                        <span className="text-lg">🛡️</span>
                    </Link>
                </div>

                {/* Mobile Menu Trigger */}
                <div className="md:hidden flex items-center gap-4">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="h-9 w-9 rounded-full bg-surface-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {theme === "dark" ? "🌙" : "☀️"}
                        </button>
                    )}
                    <div className="h-9 w-9 rounded-full bg-surface-card border border-border flex items-center justify-center">
                        <span className="text-foreground/50">☰</span>
                    </div>
                </div>

            </div>
        </header>
    );
}
