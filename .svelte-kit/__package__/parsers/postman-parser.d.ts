import type { SpecraApiSpec } from "../api-parser.types";
import type { ApiSpecParser } from "./base-parser";
/**
 * Parser for Postman Collection v2.0/v2.1
 */
export declare class PostmanParser implements ApiSpecParser {
    validate(input: any): boolean;
    parse(input: any): SpecraApiSpec;
    private extractBaseUrl;
    private findFirstRequest;
    private extractAuth;
    private extractGlobalHeaders;
    private parseItems;
    private parseRequest;
    private parseUrl;
    private buildPath;
    private parseUrlParams;
    private parseBody;
    private parseResponses;
}
