export declare const sidebarStore: {
    subscribe: (this: void, run: import("svelte/store").Subscriber<boolean>, invalidate?: () => void) => import("svelte/store").Unsubscriber;
    open: () => void;
    close: () => void;
    toggle: () => void;
    set: (this: void, value: boolean) => void;
};
