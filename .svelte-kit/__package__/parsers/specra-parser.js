/**
 * Parser for native Specra API format
 * This is a pass-through parser since the input is already in the correct format
 */
export class SpecraParser {
    validate(input) {
        return (typeof input === "object" &&
            input !== null &&
            "endpoints" in input &&
            Array.isArray(input.endpoints));
    }
    parse(input) {
        if (!this.validate(input)) {
            throw new Error("Invalid Specra API spec format");
        }
        return input;
    }
}
