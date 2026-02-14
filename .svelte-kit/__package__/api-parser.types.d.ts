/**
 * Simple API Documentation Format for Specra
 * Easy to write, easy to parse
 */
export interface ApiParam {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
    default?: any;
    example?: any;
}
export interface ApiHeader {
    name: string;
    value: string;
    description?: string;
}
export interface ApiResponse {
    status: number;
    description?: string;
    example?: any;
    schema?: any;
}
export interface ApiEndpointSpec {
    title: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    description?: string;
    pathParams?: ApiParam[];
    queryParams?: ApiParam[];
    headers?: ApiHeader[];
    body?: {
        description?: string;
        example?: any;
        schema?: any;
    };
    successResponse?: ApiResponse;
    errorResponses?: ApiResponse[];
    examples?: {
        title: string;
        language: string;
        code: string;
    }[];
}
export interface SpecraApiSpec {
    version?: string;
    title?: string;
    description?: string;
    baseUrl: string;
    env?: Record<string, string>;
    globalHeaders?: ApiHeader[];
    auth?: {
        type: "bearer" | "apiKey" | "basic";
        description?: string;
        headerName?: string;
        tokenPrefix?: string;
    };
    endpoints: ApiEndpointSpec[];
}
