interface Props {
    /** Polling interval in ms for checking content changes */
    pollInterval?: number;
    /** Whether to automatically refresh on content change */
    autoRefresh?: boolean;
}
declare const MdxHotReload: import("svelte").Component<Props, {}, "">;
type MdxHotReload = ReturnType<typeof MdxHotReload>;
export default MdxHotReload;
