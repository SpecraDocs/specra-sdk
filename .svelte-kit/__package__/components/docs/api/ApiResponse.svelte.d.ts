interface Props {
    status: number;
    description?: string;
    example?: any;
    schema?: any;
}
declare const ApiResponse: import("svelte").Component<Props, {}, "">;
type ApiResponse = ReturnType<typeof ApiResponse>;
export default ApiResponse;
