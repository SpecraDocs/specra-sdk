import { type ParserType } from '../../../parsers/index.js';
interface Props {
    /**
     * Path to the API spec JSON file (relative to /public or /static)
     * Example: "/api-specs/my-api.json"
     */
    spec: string;
    /**
     * Parser type - auto-detect by default
     * - "auto": Auto-detect format (Specra, OpenAPI, or Postman)
     * - "specra": Native Specra format
     * - "openapi": OpenAPI 3.x / Swagger
     * - "postman": Postman Collection v2.x
     */
    parser?: ParserType;
    /**
     * Show API playground for testing
     */
    showPlayground?: boolean;
}
declare const ApiReference: import("svelte").Component<Props, {}, "">;
type ApiReference = ReturnType<typeof ApiReference>;
export default ApiReference;
