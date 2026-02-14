export interface ApiParam {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
    default?: string;
}
interface Props {
    title?: string;
    params: ApiParam[];
}
declare const ApiParams: import("svelte").Component<Props, {}, "">;
type ApiParams = ReturnType<typeof ApiParams>;
export default ApiParams;
