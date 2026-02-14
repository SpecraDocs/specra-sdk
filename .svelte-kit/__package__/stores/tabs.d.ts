export declare const tabStore: {
    subscribe: (this: void, run: import("svelte/store").Subscriber<string>, invalidate?: () => void) => import("svelte/store").Unsubscriber;
    set: (tabId: string) => void;
    initialize: (defaultTab: string) => void;
    get: () => string;
};
