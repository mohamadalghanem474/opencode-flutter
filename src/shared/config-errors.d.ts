export declare class ConfigLoadError extends Error {
    readonly path: string;
    readonly cause?: unknown | undefined;
    constructor(message: string, path: string, cause?: unknown | undefined);
}
export declare class ConfigValidationError extends Error {
    readonly issues: Array<{
        path: string;
        message: string;
    }>;
    constructor(message: string, issues: Array<{
        path: string;
        message: string;
    }>);
}
//# sourceMappingURL=config-errors.d.ts.map