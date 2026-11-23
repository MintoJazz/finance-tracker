export class RecurrenceDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string
    ) {
        super(message);
        this.name = "RecurrenceDomainError";
    }
}
