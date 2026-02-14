import type { SpecraConfig } from '../../config.types.js';
interface Props {
    currentVersion: string;
    versions: string[];
    config?: SpecraConfig;
}
declare const Header: import("svelte").Component<Props, {}, "">;
type Header = ReturnType<typeof Header>;
export default Header;
