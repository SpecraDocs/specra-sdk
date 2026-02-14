import type { SpecraApiSpec } from "../api-parser.types";
import type { ApiSpecParser } from "./base-parser";
/**
 * Parser for native Specra API format
 * This is a pass-through parser since the input is already in the correct format
 */
export declare class SpecraParser implements ApiSpecParser {
    validate(input: any): boolean;
    parse(input: any): SpecraApiSpec;
}
