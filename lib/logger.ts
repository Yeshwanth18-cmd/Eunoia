interface LogData {
    [key: string]: unknown;
}

export function logEvent(event: string, data?: LogData) {
    // For now, just log to the server or browser console in a structured way.
    // Later, this could be wired to a real logging service.
    if (data) {
        // eslint-disable-next-line no-console
        console.log(`[EUNOIA] ${event}`, data);
    } else {
        // eslint-disable-next-line no-console
        console.log(`[EUNOIA] ${event}`);
    }
}
