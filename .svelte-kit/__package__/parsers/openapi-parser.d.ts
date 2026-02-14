import type { SpecraApiSpec } from "../api-parser.types";
import type { ApiSpecParser } from "./base-parser";
/**
 * Parser for OpenAPI 3.0/3.1 specifications
 */
export declare class OpenApiParser implements ApiSpecParser {
    validate(input: any): boolean;
    parse(input: any): SpecraApiSpec;
    private extractBaseUrl;
    private extractAuth;
    private parseOperation;
    private convertPathParams;
    private parseParameters;
    private parseRequestBody;
    private parseResponses;
    private generateExample;
    private resolveRef;
}
