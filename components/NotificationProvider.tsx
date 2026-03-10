'use client';

import {
    createContext,
    useCallback,
    useContext,
    useState,
    useMemo,
    ReactNode,
    useEffect,
} from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

interface NotificationContextValue {
    notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return ctx;
}

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [items, setItems] = useState<Notification[]>([]);

    const notify = useCallback((type: NotificationType, message: string) => {
        setItems((prev) => {
            const id = Date.now() + Math.random();
            return [...prev, { id, type, message }];
        });
    }, []);

    // Auto-remove notifications after 4 seconds
    useEffect(() => {
        if (items.length === 0) return;

        const timers = items.map((item) =>
            setTimeout(() => {
                setItems((prev) => prev.filter((n) => n.id !== item.id));
            }, 4000)
        );

        return () => {
            timers.forEach((t) => clearTimeout(t));
        };
    }, [items]);

    const value = useMemo(
        () => ({
            notify,
        }),
        [notify]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 font-heading pointer-events-none">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`pointer-events-auto min-w-[300px] max-w-sm px-5 py-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transform transition-all duration-500 animate-in slide-in-from-right-10 fade-in
                            ${item.type === 'success' ? 'bg-green-600/90 border-green-400/30 text-white' : ''}
                            ${item.type === 'error' ? 'bg-red-600/90 border-red-400/30 text-white' : ''}
                            ${item.type === 'info' ? 'bg-blue-600/90 border-blue-400/30 text-white' : ''}
                        `}
                    >
                        {/* Icon */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold shadow-sm
                            ${item.type === 'success' ? 'bg-green-500 text-white' : ''}
                            ${item.type === 'error' ? 'bg-red-500 text-white' : ''}
                            ${item.type === 'info' ? 'bg-blue-500 text-white' : ''}
                        `}>
                            {item.type === 'success' && '✓'}
                            {item.type === 'error' && '!'}
                            {item.type === 'info' && 'i'}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-sm uppercase tracking-wider opacity-90 mb-0.5">
                                {item.type}
                            </h4>
                            <p className="text-sm font-medium leading-tight">
                                {item.message}
                            </p>
                        </div>

                        <button
                            onClick={() => setItems((prev) => prev.filter((n) => n.id !== item.id))}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}
