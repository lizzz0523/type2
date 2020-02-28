"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var validator = require('validator');
var assert = require('assert');
var api = {
    'contains': 'contains',
    'equals': 'equals',
    'isAfter': 'after',
    'isAlpha': 'alpha',
    'isAlphanumeric': 'alphanumeric',
    'isAscii': 'ascii',
    'isBase64': 'base64',
    'isBefore': 'before',
    'isBoolean': 'boolean',
    'isByteLength': 'byteLength',
    'isCreditCard': 'creditCard',
    'isCurrency': 'currentcy',
    'isDataURI': 'dataURI',
    'isDecimal': 'decimal',
    'isDivisibleBy': 'divisibleBy',
    'isEmail': 'email',
    'isEmpty': 'empty',
    'isFQDN': 'fqdn',
    'isFloat': 'float',
    'isFullWidth': 'fullWidth',
    'isHalfWidth': 'halfWidth',
    'isHash': 'hash',
    'isHexColor': 'hexColor',
    'isHexadecimal': 'hexadecimal',
    'isIP': 'ip',
    'isISBN': 'isbn',
    'isISSN': 'issn',
    'isISIN': 'isin',
    'isISO8601': 'iso8601',
    'isISO31661Alpha2': 'iso31661Alpha2',
    'isISRC': 'isrc',
    'isIn': 'in',
    'isInt': 'int',
    'isJSON': 'json',
    'isLatLong': 'latLong',
    'isLength': 'length',
    'isLowercase': 'lowercase',
    'isMACAddress': 'macAddress',
    'isMD5': 'md5',
    'isMimeType': 'mimeType',
    'isMobilePhone': 'mobilePhone',
    'isMongoId': 'mongoId',
    'isMultibyte': 'multibyte',
    'isNumeric': 'numeric',
    'isPort': 'port',
    'isPostalCode': 'postalCode',
    'isSurrogatePair': 'surrogatePair',
    'isURL': 'url',
    'isUUID': 'uuid',
    'isUppercase': 'uppercase',
    'isVariableWidth': 'variableWidth',
    'isWhitelisted': 'whitelisted',
    'matches': 'matches'
};
module.exports = function (type2) {
    var _loop_1 = function (key) {
        assert(key in validator, "validator missing api: " + key);
        type2[api[key]] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return {
                __checkable__: api[key],
                check: function (value) {
                    if (!validator[key].apply(validator, __spreadArrays([value], args))) {
                        return { errno: 1000, errmsg: "[validtor] " + key + " error" };
                    }
                }
            };
        };
    };
    for (var key in api) {
        _loop_1(key);
    }
};
//# sourceMappingURL=validator.js.map