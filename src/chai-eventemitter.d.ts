declare namespace Chai {
    interface Assertion {
        emitFrom: EmitFrom;
    }

    interface EmitFrom {
        (ee: any, eventName: string, message?: string): Assertion;
    }
}

