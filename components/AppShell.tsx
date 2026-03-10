'use client';

import { type ReactNode } from 'react';
import { NavBar } from './NavBar';
import { NotificationProvider } from './NotificationProvider';

interface UserProfile {
    name?: string;
    email?: string;
}

interface AppShellProps {
    children: ReactNode;
    user?: UserProfile | null;
}

export function AppShell({ children, user }: AppShellProps) {
    return (
        <div className="min-h-screen text-foreground relative transition-colors duration-500">
            <NotificationProvider>
                <NavBar user={user} />
                <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12 space-y-8">
                    {children}
                </main>
            </NotificationProvider>
        </div>
    );
}
