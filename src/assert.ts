/**
 * 这是从node的lib库中，引入的部分assert库的实现，为了同时兼容node/browser
 * https://github.com/nodejs/node/blob/master/lib/internal/assert/assertion_error.js
 */

class AssertError extends Error {
    code: string
    actual: any
    expected: boolean
    operator: string

    constructor (actual: any, message: string, startFunction: any) {
        const limit = Error.stackTraceLimit
        Error.stackTraceLimit = 0
        super(message)
        Error.stackTraceLimit = limit

        Object.defineProperty(this, 'name', {
            value: 'AssertionError [ERR_ASSERTION]',
            enumerable: false,
            writable: true,
            configurable: true
        })
        this.code = 'ERR_ASSERTION'
        this.actual = actual
        this.expected = true
        this.operator = '=='

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, startFunction)
        }
        // Create error message including the error code in the name.
        this.stack
        // Reset the name.
        this.name = 'AssertionError'
    }

    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
}

module.exports = function assert(value: any, message?: string | Error) {
    if (!value) {
        if (!message) {
            message = 'No value argument passed to `assert()`'
        } else if (message instanceof Error) {
            throw message
        }

        throw new AssertError(value, message, assert)
    }
}