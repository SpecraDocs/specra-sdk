/**
 * Specra API Documentation Schema
 * Supports REST, GraphQL, and WebSocket APIs
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface ApiParameter {
    name: string;
    type: string;
    required?: boolean;
    description?: string;
    default?: any;
    example?: any;
    enum?: string[];
}
export interface ApiResponse {
    status: number;
    description: string;
    schema?: any;
    example?: any;
    headers?: Record<string, string>;
}
export interface ApiExample {
    title: string;
    language: string;
    code: string;
}
export interface ApiAuthentication {
    type: "apiKey" | "bearer" | "basic" | "oauth2" | "none";
    description?: string;
    location?: "header" | "query" | "cookie";
    name?: string;
    scheme?: string;
}
export interface RestEndpoint {
    type: "rest";
    method: HttpMethod;
    path: string;
    summary: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    deprecated?: boolean;
    authentication?: ApiAuthentication;
    pathParams?: ApiParameter[];
    queryParams?: ApiParameter[];
    headers?: ApiParameter[];
    body?: {
        contentType: string;
        schema?: any;
        example?: any;
        description?: string;
    };
    responses: ApiResponse[];
    examples?: ApiExample[];
}
export interface GraphQLField {
    name: string;
    type: string;
    description?: string;
    args?: ApiParameter[];
    deprecated?: boolean;
    deprecationReason?: string;
}
export interface GraphQLType {
    name: string;
    kind: "OBJECT" | "INPUT_OBJECT" | "ENUM" | "SCALAR" | "INTERFACE" | "UNION";
    description?: string;
    fields?: GraphQLField[];
    enumValues?: {
        name: string;
        description?: string;
    }[];
}
export interface GraphQLQuery {
    type: "graphql";
    operationType: "query" | "mutation" | "subscription";
    name: string;
    description?: string;
    args?: ApiParameter[];
    returnType: string;
    example?: string;
    response?: any;
}
export interface GraphQLSchema {
    queries?: GraphQLQuery[];
    mutations?: GraphQLQuery[];
    subscriptions?: GraphQLQuery[];
    types?: GraphQLType[];
}
export interface WebSocketEvent {
    type: "websocket";
    event: string;
    direction: "client-to-server" | "server-to-client" | "bidirectional";
    description?: string;
    payload?: {
        schema?: any;
        example?: any;
    };
    response?: {
        schema?: any;
        example?: any;
    };
}
export interface WebSocketConnection {
    url: string;
    authentication?: ApiAuthentication;
    description?: string;
    events: WebSocketEvent[];
}
export interface ApiDocumentation {
    version: string;
    title: string;
    description?: string;
    baseUrl?: string;
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    rest?: {
        endpoints: RestEndpoint[];
    };
    graphql?: GraphQLSchema;
    websocket?: WebSocketConnection[];
    authentication?: ApiAuthentication[];
    headers?: Record<string, string>;
}
export interface ApiSpecConfig {
    source: "openapi" | "postman" | "insomnia" | "specra" | "manual";
    path?: string;
    spec?: ApiDocumentation;
    autoGenerate?: boolean;
    outputDir?: string;
}
export interface ParsedApiSpec {
    source: ApiSpecConfig["source"];
    documentation: ApiDocumentation;
}
