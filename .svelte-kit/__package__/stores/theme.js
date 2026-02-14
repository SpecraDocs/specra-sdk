import { writable } from 'svelte/store';
import { browser } from '$app/environment';
const THEME_STORAGE_KEY = 'specra-theme';
function getInitialTheme() {
    if (!browser)
        return 'system';
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    }
    catch {
        // Ignore localStorage errors
    }
    return 'system';
}
function getResolvedTheme(theme) {
    if (theme !== 'system')
        return theme;
    if (!browser)
        return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function createThemeStore() {
    const initial = getInitialTheme();
    const { subscribe, set, update } = writable(initial);
    function setTheme(theme) {
        set(theme);
        if (browser) {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            }
            catch {
                // Ignore localStorage errors
            }
            applyTheme(theme);
        }
    }
    function applyTheme(theme) {
        if (!browser)
            return;
        const resolved = getResolvedTheme(theme);
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
    }
    function toggle() {
        update((current) => {
            const resolved = getResolvedTheme(current);
            const next = resolved === 'dark' ? 'light' : 'dark';
            setTheme(next);
            return next;
        });
    }
    // Apply initial theme on creation
    if (browser) {
        applyTheme(initial);
        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            const currentTheme = getInitialTheme();
            if (currentTheme === 'system') {
                applyTheme('system');
            }
        });
    }
    return {
        subscribe,
        set: setTheme,
        toggle,
        getResolved: () => getResolvedTheme(getInitialTheme())
    };
}
export const themeStore = createThemeStore();
