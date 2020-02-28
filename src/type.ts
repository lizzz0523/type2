const assert = require('./assert')

interface IContructor {
    new(...args: any[]): any
}

interface IError {
    errno: number
    errmsg: string
}

interface IErrorMap {
    [key: string]: IError
}

interface ITypeError extends IError {
    key: string
    value: any
}

interface ICondition {
    (root: any, parent: any, value: any): boolean
}

interface ICheckable {
    __checkable__: string

    skip?: (value: any) => boolean
    check: (value: any) => IError | void
}

interface ICheckableContructor {
    new (...args: any[]): ICheckable
}

interface ICheckableMap {
    [key: string]: ICheckable
}

const ErrorType: IErrorMap = {
    TYPE_MISMATCH: { errno: 1, errmsg: '类型错误' },
    VALUE_MISMATCH: { errno: 2, errmsg: '数值错误' },
    KEY_UNDEFINED: { errno: 3, errmsg: '属性不存在' },
    STR_LENGTH: { errno: 4, errmsg: '字符串长度错误' },
    STR_PATTERN: { errno: 5, errmsg: '字符串模式匹配错误' },
    NUM_MINNUM: { errno: 6, errmsg: '小于最小值' },
    NUM_MAXNUM: { errno: 7, errmsg: '大于最大值' },
}

function isType<T>(type: string) {
    return function(value: any): value is T {
        return Object.prototype.toString.call(value) === '[object ' + type + ']'
    }
}

const isArray = isType<any[]>('Array')
const isString = isType<string>('String')
const isNumber = isType<number>('Number')
const isBoolean = isType<boolean>('Boolean')
const isObject = isType<Object>('Object')

function isCheckable(value: any): value is ICheckable {
    return value && value.__checkable__
}

function isFunction(value: any) {
    return typeof value === 'function'
}

function isPlainObject(value: any) {
    return value !== null && isObject(value)
}

function hasOwnProperty(value: any, key: string) {
    return Object.prototype.hasOwnProperty.call(value, key)
}

class Stack<T> {
    private list_: T[] = []

    push(value: T): void {
        this.list_.push(value)
    }

    pop(): T | void {
        return this.list_.pop()
    }

    tail(): T | void {
        return this.list_[0]
    }

    head(offset: number = 0): T | void {
        return this.list_[this.list_.length - offset - 1]
    }

    isEmpty(): boolean {
        return this.list_.length === 0
    }
}

class TypeChecker {
    private static checkerStack_: Stack<TypeChecker> = new Stack()

    static currentChecker(): TypeChecker {
        assert(!this.checkerStack_.isEmpty(), 'current checker is undefined')
        return this.checkerStack_.head() as TypeChecker
    }

    static pushStack(checker: TypeChecker): void {
        this.checkerStack_.push(checker)
    }

    static popStack(): TypeChecker {
        assert(!this.checkerStack_.isEmpty(), 'checker stack is empty')
        return this.checkerStack_.pop() as TypeChecker
    }

    // 当前正在处理的对象堆栈
    private valueStack_: Stack<any> = new Stack()
    // 当前处理时捕获的错误
    private globalError_: ITypeError[] = []

    rootValue() {
        return this.valueStack_.tail()
    }

    lastValue() {
        return this.valueStack_.head(1)
    }

    check(
        key: string,
        value: any,
        rule: ICheckable | ICheckable[] | ICheckableMap
    ): void {
        // 保存当前要检测的值
        this.valueStack_.push(value)

        if (isCheckable(rule)) {
            this.checkValue_(key, value, rule)
        } else if (isArray(rule)) {
            this.checkArray_(key, value, rule)
        } else {
            this.checkObject_(key, value, rule)
        }

        // 推出已经处理完的值
        this.valueStack_.pop()
    }

    errors(): ITypeError[] | null {
        const errors = this.globalError_.slice(0)
        return errors.length ? errors : null
    }

    private checkValue_(key: string, value: any, rule: ICheckable): void {
        if (rule.skip && rule.skip(value)) {
            return
        }

        this.markError_(key, value, rule.check(value))
    }

    private checkArray_(key: string, value: any, rules: ICheckable[]): void {
        if (!isArray(value)) {
            this.markError_(key, value, ErrorType.TYPE_MISMATCH)
        } else {
            if (rules.length === 1) {
                const rule = rules[0]

                value.forEach((subValue, index) => {
                    this.check(key + '.' + index, subValue, rule)
                })
            } else {
                rules.forEach((subRule, index) => {
                    this.check(key + '.' + index, value[index], subRule)
                })
            }
        }
    }

    private checkObject_(key: string, value: any, rule: ICheckableMap): void {
        if (!isPlainObject(value)) {
            this.markError_(key, value, ErrorType.TYPE_MISMATCH)
        } else {
            Object.keys(rule).forEach(subKey => {
                if (!hasOwnProperty(value, subKey)) {
                    // 捕获所有KEY_UNDEFINED错误
                    this.markError_(subKey, void 0, ErrorType.KEY_UNDEFINED)
                } else {
                    this.check(key + '.' + subKey, value[subKey], rule[subKey])
                }
            })
        }
    }

    private markError_(key: string, value: any, error: IError | void) {
        if (error) {
            this.globalError_.push({ key, value, ...error })
        }
    }
}

abstract class Checkable implements ICheckable {
    __checkable__: string = 'base'

    private optional_: boolean = false
    private conditions_: ICondition[] = []

    abstract check(value: any): IError | void

    skip(value: any): boolean {
        if (this.isOptional_() && this.isEmpty_(value)) {
            return true
        }

        if (this.isConditional_() && !this.isMatch_(value)) {
            return true
        }

        return false
    }

    when(condition: ICondition): Checkable {
        this.conditions_.push(condition)
        return this
    }

    optional(): Checkable {
        this.optional_ = true
        return this
    }

    private isOptional_(): boolean {
        return this.optional_
    }

    private isConditional_(): boolean {
        return this.conditions_.length > 0
    }

    private isEmpty_(value: any): boolean {
        return value === void 0 || value === null || value === ''
    }

    private isMatch_(value: any): boolean {
        const currentChecker = TypeChecker.currentChecker()
        const root = currentChecker.rootValue()
        const last = currentChecker.lastValue()

        return this.conditions_.every(condition => condition(root, last, value))
    }
}

class TObject extends Checkable {
    __checkable__: string = 'object'

    check(value: any): IError | void {
        if (!isPlainObject(value)) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TArray extends Checkable {
    __checkable__: string = 'array'

    check(value: any): IError | void {
        if (!isArray(value)) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TString extends Checkable {
    __checkable__: string = 'string'

    private maxLength_: number | null = null
    private pattern_: RegExp | null = null

    check(value: any): IError | void {
        if (!isString(value)) {
            return ErrorType.TYPE_MISMATCH
        }

        const trimedValue = value.trim()

        if (trimedValue.length === 0) {
            return ErrorType.STR_LENGTH
        }

        if (this.maxLength_ !== null && trimedValue.length > this.maxLength_) {
            return ErrorType.STR_LENGTH
        }

        if (this.pattern_ !== null && !trimedValue.match(this.pattern_)) {
            return ErrorType.STR_PATTERN
        }
    }

    length(maxLength: number) {
        this.maxLength_ = maxLength
        return this
    }

    match(pattern: RegExp) {
        this.pattern_ = pattern
        return this
    }
}

class TNumber extends Checkable {
    __checkable__: string = 'number'

    private minValue_: number | null = null
    private maxValue_: number | null = null

    check(value: any): IError | void {
        if (!isNumber(value)) {
            return ErrorType.TYPE_MISMATCH
        }

        if (this.minValue_ !== null && value < this.minValue_) {
            return ErrorType.NUM_MINNUM
        }

        if (this.maxValue_ !== null && value > this.maxValue_) {
            return ErrorType.NUM_MAXNUM
        }
    }

    max(maxValue: number) {
        this.maxValue_ = maxValue
        return this
    }

    min(minValue: number) {
        this.minValue_ = minValue
        return this
    }

    range(minValue: number, maxValue: number) {
        if (minValue > maxValue) {
            const tmpValue = minValue
            minValue = maxValue
            maxValue = tmpValue
        }

        this.min(minValue)
        this.max(maxValue)

        return this
    }
}

class TBoolean extends Checkable {
    __checkable__: string = 'bool'

    check(value: any): IError | void {
        if (!isBoolean(value)) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TFunction extends Checkable {
    __checkable__: string = 'func'

    check(value: any): IError | void {
        if (!isFunction(value)) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TOneOf extends Checkable {
    __checkable__: string = 'oneOf'

    private options_: any[]

    constructor(options: any[]) {
        super()

        this.options_ = options
    }
    
    check(value: any): IError | void {
        // 这里的options实际上可以包含ICheckable
        const error = this.options_.every(option => {
            if (isCheckable(option)) {
                return option.check(value) !== void 0
            } else {
                return option !== value
            }
        })

        if (error) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TInstanceOf extends Checkable {
    __checkable__: string = 'instanceOf'

    private klass_: IContructor

    constructor(klass: IContructor) {
        super()

        this.klass_ = klass
    }

    check(value: any): IError | void {
        if (!(value instanceof this.klass_)) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

class TEqual extends Checkable {
    __checkable__: string = 'equal'

    private value_: any

    constructor(value: any) {
        super()

        this.value_ = value
    }

    check(value: any): IError | void {
        if (value !== this.value_) {
            return ErrorType.TYPE_MISMATCH
        }
    }
}

function instance(Checkable: ICheckableContructor) {
    return function(...args: any[]) {
        return new Checkable(...args)
    }
}

const type = {
    check: (value: any, rule: ICheckable | ICheckable[] | ICheckableMap) => {
        const checker = new TypeChecker()

        TypeChecker.pushStack(checker)

        checker.check('', value, rule)

        TypeChecker.popStack()

        return checker.errors()
    },
    apply: (plugin: any) => {
        assert(isFunction(plugin), 'plugin must be a function')
        return plugin(type)
    },
    object: instance(TObject),
    array: instance(TArray),
    string: instance(TString),
    number: instance(TNumber),
    bool: instance(TBoolean),
    func: instance(TFunction),
    oneOf: instance(TOneOf),
    instanceOf: instance(TInstanceOf),
    equal: instance(TEqual)
}

exports.type = type