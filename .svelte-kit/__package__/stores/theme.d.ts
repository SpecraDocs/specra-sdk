export type Theme = 'light' | 'dark' | 'system';
export declare const themeStore: {
    subscribe: (this: void, run: import("svelte/store").Subscriber<Theme>, invalidate?: () => void) => import("svelte/store").Unsubscriber;
    set: (theme: Theme) => void;
    toggle: () => void;
    getResolved: () => "light" | "dark";
};
