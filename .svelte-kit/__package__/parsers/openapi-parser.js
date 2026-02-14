/**
 * Parser for OpenAPI 3.0/3.1 specifications
 */
export class OpenApiParser {
    validate(input) {
        return (typeof input === "object" &&
            input !== null &&
            ("openapi" in input || "swagger" in input) &&
            "paths" in input);
    }
    parse(input) {
        if (!this.validate(input)) {
            throw new Error("Invalid OpenAPI spec format");
        }
        const baseUrl = this.extractBaseUrl(input);
        const endpoints = [];
        // Parse paths
        for (const [path, pathItem] of Object.entries(input.paths || {})) {
            const methods = ["get", "post", "put", "patch", "delete"];
            for (const method of methods) {
                const operation = pathItem[method];
                if (!operation)
                    continue;
                const endpoint = this.parseOperation(path, method.toUpperCase(), operation, input);
                endpoints.push(endpoint);
            }
        }
        return {
            version: input.info?.version,
            title: input.info?.title,
            description: input.info?.description,
            baseUrl,
            auth: this.extractAuth(input),
            endpoints,
        };
    }
    extractBaseUrl(spec) {
        // OpenAPI 3.x servers
        if (spec.servers && spec.servers.length > 0) {
            return spec.servers[0].url;
        }
        // Swagger 2.0
        if (spec.host) {
            const scheme = spec.schemes?.[0] || "https";
            const basePath = spec.basePath || "";
            return `${scheme}://${spec.host}${basePath}`;
        }
        return "";
    }
    extractAuth(spec) {
        const securitySchemes = spec.components?.securitySchemes || spec.securityDefinitions;
        if (!securitySchemes)
            return undefined;
        // Get the first security scheme
        const firstScheme = Object.values(securitySchemes)[0];
        if (!firstScheme)
            return undefined;
        if (firstScheme.type === "http" && firstScheme.scheme === "bearer") {
            return {
                type: "bearer",
                description: firstScheme.description,
                tokenPrefix: "Bearer",
            };
        }
        if (firstScheme.type === "apiKey") {
            return {
                type: "apiKey",
                description: firstScheme.description,
                headerName: firstScheme.name || "X-API-Key",
            };
        }
        if (firstScheme.type === "http" && firstScheme.scheme === "basic") {
            return {
                type: "basic",
                description: firstScheme.description,
            };
        }
        return undefined;
    }
    parseOperation(path, method, operation, spec) {
        const endpoint = {
            title: operation.summary || operation.operationId || `${method} ${path}`,
            method,
            path: this.convertPathParams(path),
            description: operation.description,
        };
        // Parse parameters
        const params = this.parseParameters(operation.parameters || [], spec);
        if (params.path.length > 0)
            endpoint.pathParams = params.path;
        if (params.query.length > 0)
            endpoint.queryParams = params.query;
        if (params.header.length > 0) {
            endpoint.headers = params.header.map((p) => ({
                name: p.name,
                value: p.example || "",
                description: p.description,
            }));
        }
        // Parse request body
        if (operation.requestBody) {
            endpoint.body = this.parseRequestBody(operation.requestBody, spec);
        }
        // Parse responses
        const responses = this.parseResponses(operation.responses || {}, spec);
        if (responses.success)
            endpoint.successResponse = responses.success;
        if (responses.errors.length > 0)
            endpoint.errorResponses = responses.errors;
        return endpoint;
    }
    convertPathParams(path) {
        // Convert OpenAPI {param} to :param
        return path.replace(/\{([^}]+)\}/g, ":$1");
    }
    parseParameters(parameters, spec) {
        const result = { path: [], query: [], header: [] };
        for (const param of parameters) {
            // Resolve $ref if present
            const resolved = param.$ref ? this.resolveRef(param.$ref, spec) : param;
            const apiParam = {
                name: resolved.name,
                type: resolved.schema?.type || resolved.type || "string",
                required: resolved.required,
                description: resolved.description,
                example: resolved.example || resolved.schema?.example,
            };
            if (resolved.in === "path")
                result.path.push(apiParam);
            else if (resolved.in === "query")
                result.query.push(apiParam);
            else if (resolved.in === "header")
                result.header.push(apiParam);
        }
        return result;
    }
    parseRequestBody(requestBody, spec) {
        const content = requestBody.content?.["application/json"];
        if (!content)
            return undefined;
        return {
            description: requestBody.description,
            example: content.example || this.generateExample(content.schema, spec),
            schema: content.schema,
        };
    }
    parseResponses(responses, spec) {
        const result = { errors: [] };
        for (const [statusCode, response] of Object.entries(responses)) {
            const status = parseInt(statusCode);
            if (isNaN(status))
                continue;
            const resolved = response.$ref ? this.resolveRef(response.$ref, spec) : response;
            const content = resolved.content?.["application/json"];
            const apiResponse = {
                status,
                description: resolved.description,
                example: content?.example || this.generateExample(content?.schema, spec),
                schema: content?.schema,
            };
            if (status >= 200 && status < 300) {
                result.success = apiResponse;
            }
            else {
                result.errors.push(apiResponse);
            }
        }
        return result;
    }
    generateExample(schema, spec) {
        if (!schema)
            return undefined;
        if (schema.$ref)
            schema = this.resolveRef(schema.$ref, spec);
        if (schema.example)
            return schema.example;
        // Simple example generation based on schema type
        if (schema.type === "object" && schema.properties) {
            const example = {};
            for (const [key, prop] of Object.entries(schema.properties)) {
                example[key] = this.generateExample(prop, spec);
            }
            return example;
        }
        if (schema.type === "array" && schema.items) {
            return [this.generateExample(schema.items, spec)];
        }
        // Default values by type
        const defaults = {
            string: "string",
            number: 0,
            integer: 0,
            boolean: false,
            object: {},
            array: [],
        };
        return defaults[schema.type] || null;
    }
    resolveRef(ref, spec) {
        const path = ref.replace(/^#\//, "").split("/");
        let current = spec;
        for (const segment of path) {
            current = current[segment];
            if (!current)
                return {};
        }
        return current;
    }
}
