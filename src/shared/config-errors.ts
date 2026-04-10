// ---------------------------------------------------------------------------
// Config error types for opencode-flutter
// ---------------------------------------------------------------------------

export class ConfigLoadError extends Error {
    constructor(
        message: string,
        public readonly path: string,
        public readonly cause?: unknown,
    ) {
        super(message)
        this.name = "ConfigLoadError"
    }
}

export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public readonly issues: Array<{ path: string; message: string }>,
    ) {
        super(message)
        this.name = "ConfigValidationError"
    }
}
