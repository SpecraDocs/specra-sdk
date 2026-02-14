import type { Snippet } from 'svelte';
interface Props {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    summary?: string;
    children?: Snippet;
    defaultOpen?: boolean;
}
declare const ApiEndpoint: import("svelte").Component<Props, {}, "">;
type ApiEndpoint = ReturnType<typeof ApiEndpoint>;
export default ApiEndpoint;
