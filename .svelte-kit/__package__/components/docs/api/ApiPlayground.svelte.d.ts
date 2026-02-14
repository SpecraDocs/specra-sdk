export interface PathParam {
    name: string;
    type: string;
    example?: any;
}
interface Props {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    defaultBody?: string;
    pathParams?: PathParam[];
}
declare const ApiPlayground: import("svelte").Component<Props, {}, "">;
type ApiPlayground = ReturnType<typeof ApiPlayground>;
export default ApiPlayground;
