"use strict";
/**
 * 这是从node的lib库中，引入的部分assert库的实现，为了同时兼容node/browser
 * https://github.com/nodejs/node/blob/master/lib/internal/assert/assertion_error.js
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AssertError = /** @class */ (function (_super) {
    __extends(AssertError, _super);
    function AssertError(actual, message, startFunction) {
        var _this = this;
        var limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        _this = _super.call(this, message) || this;
        Error.stackTraceLimit = limit;
        Object.defineProperty(_this, 'name', {
            value: 'AssertionError [ERR_ASSERTION]',
            enumerable: false,
            writable: true,
            configurable: true
        });
        _this.code = 'ERR_ASSERTION';
        _this.actual = actual;
        _this.expected = true;
        _this.operator = '==';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, startFunction);
        }
        // Create error message including the error code in the name.
        _this.stack;
        // Reset the name.
        _this.name = 'AssertionError';
        return _this;
    }
    AssertError.prototype.toString = function () {
        return this.name + " [" + this.code + "]: " + this.message;
    };
    return AssertError;
}(Error));
module.exports = function assert(value, message) {
    if (!value) {
        if (!message) {
            message = 'No value argument passed to `assert()`';
        }
        else if (message instanceof Error) {
            throw message;
        }
        throw new AssertError(value, message, assert);
    }
};
//# sourceMappingURL=assert.js.map