import type { SpecraConfig } from '../../config.types.js';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    config: SpecraConfig;
}
declare const SearchModal: import("svelte").Component<Props, {}, "">;
type SearchModal = ReturnType<typeof SearchModal>;
export default SearchModal;
