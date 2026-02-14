import type { SpecraApiSpec } from "../api-parser.types";
import type { ApiSpecParser } from "./base-parser";
import { SpecraParser } from "./specra-parser";
import { OpenApiParser } from "./openapi-parser";
import { PostmanParser } from "./postman-parser";
export type ParserType = "auto" | "specra" | "openapi" | "postman";
/**
 * Auto-detect the parser type based on the input structure
 */
export declare function detectParserType(input: any): ParserType;
/**
 * Parse an API spec using the specified or auto-detected parser
 */
export declare function parseApiSpec(input: any, parserType?: ParserType): SpecraApiSpec;
export { SpecraParser, OpenApiParser, PostmanParser };
export type { ApiSpecParser };
