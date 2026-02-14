import { writable } from 'svelte/store';
function createSidebarStore() {
    const { subscribe, set, update } = writable(false);
    return {
        subscribe,
        open: () => set(true),
        close: () => set(false),
        toggle: () => update((v) => !v),
        set
    };
}
export const sidebarStore = createSidebarStore();
