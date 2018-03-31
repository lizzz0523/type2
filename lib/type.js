"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var assert = require('assert');
var ErrorType = {
    TYPE_MISMATCH: { errno: 1, errmsg: '类型错误' },
    VALUE_MISMATCH: { errno: 2, errmsg: '数值错误' },
    KEY_UNDEFINED: { errno: 3, errmsg: '属性不存在' },
    STR_LENGTH: { errno: 4, errmsg: '字符串长度错误' },
    STR_PATTERN: { errno: 5, errmsg: '字符串模式匹配错误' },
    NUM_MINNUM: { errno: 6, errmsg: '小于最小值' },
    NUM_MAXNUM: { errno: 7, errmsg: '大于最大值' },
};
function isType(type) {
    return function (value) {
        return Object.prototype.toString.call(value) === '[object ' + type + ']';
    };
}
var isArray = isType('Array');
var isString = isType('String');
var isNumber = isType('Number');
var isBoolean = isType('Boolean');
var isPlainObject = isType('Object');
function isCheckable(value) {
    return value && value.__checkable__;
}
function isFunction(value) {
    return typeof value === 'function';
}
function hasOwnProperty(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
var Stack = /** @class */ (function () {
    function Stack() {
        this.list_ = [];
    }
    Stack.prototype.push = function (value) {
        this.list_.push(value);
    };
    Stack.prototype.pop = function () {
        return this.list_.pop();
    };
    Stack.prototype.tail = function () {
        return this.list_[0];
    };
    Stack.prototype.head = function (offset) {
        if (offset === void 0) { offset = 0; }
        return this.list_[this.list_.length - offset - 1];
    };
    Stack.prototype.isEmpty = function () {
        return this.list_.length === 0;
    };
    return Stack;
}());
var TypeChecker = /** @class */ (function () {
    function TypeChecker() {
        // 当前正在处理的对象堆栈
        this.valueStack_ = new Stack();
        // 当前处理时捕获的错误
        this.globalError_ = [];
    }
    TypeChecker.currentChecker = function () {
        assert(!this.checkerStack_.isEmpty(), 'current checker is undefined');
        return this.checkerStack_.head();
    };
    TypeChecker.pushStack = function (checker) {
        this.checkerStack_.push(checker);
    };
    TypeChecker.popStack = function () {
        assert(!this.checkerStack_.isEmpty(), 'checker stack is empty');
        return this.checkerStack_.pop();
    };
    TypeChecker.prototype.rootValue = function () {
        return this.valueStack_.tail();
    };
    TypeChecker.prototype.lastValue = function () {
        return this.valueStack_.head(1);
    };
    TypeChecker.prototype.check = function (key, value, rule) {
        // 保存当前要检测的值
        this.valueStack_.push(value);
        if (isCheckable(rule)) {
            this.checkValue_(key, value, rule);
        }
        else if (isArray(rule)) {
            this.checkArray_(key, value, rule);
        }
        else {
            this.checkObject_(key, value, rule);
        }
        // 推出已经处理完的值
        this.valueStack_.pop();
    };
    TypeChecker.prototype.errors = function () {
        var errors = this.globalError_.slice(0);
        return errors.length ? errors : null;
    };
    TypeChecker.prototype.checkValue_ = function (key, value, rule) {
        if (rule.skip && rule.skip(value)) {
            return;
        }
        this.markError_(key, rule.check(value));
    };
    TypeChecker.prototype.checkArray_ = function (key, value, rules) {
        var _this = this;
        if (!isArray(value)) {
            this.markError_(key, ErrorType.TYPE_MISMATCH);
        }
        else {
            if (rules.length === 1) {
                var rule_1 = rules[0];
                value.forEach(function (subValue, index) {
                    _this.check(key + '.' + index, subValue, rule_1);
                });
            }
            else {
                rules.forEach(function (subRule, index) {
                    _this.check(key + '.' + index, value[index], subRule);
                });
            }
        }
    };
    TypeChecker.prototype.checkObject_ = function (key, value, rule) {
        var _this = this;
        if (!isPlainObject(value)) {
            this.markError_(key, ErrorType.TYPE_MISMATCH);
        }
        else {
            Object.keys(rule).forEach(function (subKey) {
                if (!hasOwnProperty(value, subKey)) {
                    // 捕获所有KEY_UNDEFINED错误
                    _this.markError_(subKey, ErrorType.KEY_UNDEFINED);
                }
                else {
                    _this.check(key + '.' + subKey, value[subKey], rule[subKey]);
                }
            });
        }
    };
    TypeChecker.prototype.markError_ = function (key, error) {
        if (error) {
            this.globalError_.push(__assign({ key: key }, error));
        }
    };
    TypeChecker.checkerStack_ = new Stack();
    return TypeChecker;
}());
var Checkable = /** @class */ (function () {
    function Checkable() {
        this.__checkable__ = 'base';
        this.optional_ = false;
        this.conditions_ = [];
    }
    Checkable.prototype.skip = function (value) {
        if (this.isOptional_() && this.isEmpty_(value)) {
            return true;
        }
        if (this.isConditional_() && !this.isMatch_(value)) {
            return true;
        }
        return false;
    };
    Checkable.prototype.when = function (condition) {
        this.conditions_.push(condition);
        return this;
    };
    Checkable.prototype.optional = function () {
        this.optional_ = true;
        return this;
    };
    Checkable.prototype.isOptional_ = function () {
        return this.optional_;
    };
    Checkable.prototype.isConditional_ = function () {
        return this.conditions_.length > 0;
    };
    Checkable.prototype.isEmpty_ = function (value) {
        return value === void 0 || value === null || value === '';
    };
    Checkable.prototype.isMatch_ = function (value) {
        var currentChecker = TypeChecker.currentChecker();
        var root = currentChecker.rootValue();
        var last = currentChecker.lastValue();
        return this.conditions_.every(function (condition) { return condition(root, last, value); });
    };
    return Checkable;
}());
var TObject = /** @class */ (function (_super) {
    __extends(TObject, _super);
    function TObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'object';
        return _this;
    }
    TObject.prototype.check = function (value) {
        if (!isPlainObject(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TObject;
}(Checkable));
var TArray = /** @class */ (function (_super) {
    __extends(TArray, _super);
    function TArray() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'array';
        return _this;
    }
    TArray.prototype.check = function (value) {
        if (!isArray(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TArray;
}(Checkable));
var TString = /** @class */ (function (_super) {
    __extends(TString, _super);
    function TString() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'string';
        _this.maxLength_ = null;
        _this.pattern_ = null;
        return _this;
    }
    TString.prototype.check = function (value) {
        if (!isString(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
        var trimedValue = value.trim();
        if (trimedValue.length === 0) {
            return ErrorType.STR_LENGTH;
        }
        if (this.maxLength_ !== null && trimedValue.length > this.maxLength_) {
            return ErrorType.STR_LENGTH;
        }
        if (this.pattern_ !== null && !trimedValue.match(this.pattern_)) {
            return ErrorType.STR_PATTERN;
        }
    };
    TString.prototype.length = function (maxLength) {
        this.maxLength_ = maxLength;
        return this;
    };
    TString.prototype.match = function (pattern) {
        this.pattern_ = pattern;
        return this;
    };
    return TString;
}(Checkable));
var TNumber = /** @class */ (function (_super) {
    __extends(TNumber, _super);
    function TNumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'number';
        _this.minValue_ = null;
        _this.maxValue_ = null;
        return _this;
    }
    TNumber.prototype.check = function (value) {
        if (!isNumber(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
        if (this.minValue_ !== null && value < this.minValue_) {
            return ErrorType.NUM_MINNUM;
        }
        if (this.maxValue_ !== null && value > this.maxValue_) {
            return ErrorType.NUM_MAXNUM;
        }
    };
    TNumber.prototype.max = function (maxValue) {
        this.maxValue_ = maxValue;
        return this;
    };
    TNumber.prototype.min = function (minValue) {
        this.minValue_ = minValue;
        return this;
    };
    TNumber.prototype.range = function (minValue, maxValue) {
        if (minValue > maxValue) {
            var tmpValue = minValue;
            minValue = maxValue;
            maxValue = tmpValue;
        }
        this.min(minValue);
        this.max(maxValue);
        return this;
    };
    return TNumber;
}(Checkable));
var TBoolean = /** @class */ (function (_super) {
    __extends(TBoolean, _super);
    function TBoolean() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'bool';
        return _this;
    }
    TBoolean.prototype.check = function (value) {
        if (!isBoolean(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TBoolean;
}(Checkable));
var TFunction = /** @class */ (function (_super) {
    __extends(TFunction, _super);
    function TFunction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.__checkable__ = 'func';
        return _this;
    }
    TFunction.prototype.check = function (value) {
        if (!isFunction(value)) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TFunction;
}(Checkable));
var TOneOf = /** @class */ (function (_super) {
    __extends(TOneOf, _super);
    function TOneOf(options) {
        var _this = _super.call(this) || this;
        _this.__checkable__ = 'oneOf';
        _this.options_ = options;
        return _this;
    }
    TOneOf.prototype.check = function (value) {
        // 这里的options实际上可以包含ICheckable
        var error = this.options_.every(function (option) {
            if (isCheckable(option)) {
                return option.check(value) !== void 0;
            }
            else {
                return option !== value;
            }
        });
        if (error) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TOneOf;
}(Checkable));
var TInstanceOf = /** @class */ (function (_super) {
    __extends(TInstanceOf, _super);
    function TInstanceOf(klass) {
        var _this = _super.call(this) || this;
        _this.__checkable__ = 'instanceOf';
        _this.klass_ = klass;
        return _this;
    }
    TInstanceOf.prototype.check = function (value) {
        if (!(value instanceof this.klass_)) {
            return ErrorType.TYPE_MISMATCH;
        }
    };
    return TInstanceOf;
}(Checkable));
function instance(Checkable) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (Checkable.bind.apply(Checkable, [void 0].concat(args)))();
    };
}
var type = {
    check: function (value, rule) {
        var checker = new TypeChecker();
        TypeChecker.pushStack(checker);
        checker.check('', value, rule);
        TypeChecker.popStack();
        return checker.errors();
    },
    apply: function (plugin) {
        assert(isFunction(plugin), 'plugin must be a function');
        return plugin(type);
    },
    object: instance(TObject),
    array: instance(TArray),
    string: instance(TString),
    number: instance(TNumber),
    bool: instance(TBoolean),
    func: instance(TFunction),
    oneOf: instance(TOneOf),
    instanceOf: instance(TInstanceOf)
};
exports.type = type;
//# sourceMappingURL=type.js.map