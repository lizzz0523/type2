"use strict";
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
    'isByteLength': 'bytelength',
    'isCreditCard': 'creditcard',
    'isCurrency': 'currentcy',
    'isDataURI': 'datauri',
    'isDecimal': 'decimal',
    'isDivisibleBy': 'divisibleby',
    'isEmail': 'email',
    'isEmpty': 'empty',
    'isFQDN': 'fqdn',
    'isFloat': 'float',
    'isFullWidth': 'fullwidth',
    'isHalfWidth': 'halfwidth',
    'isHash': 'hash',
    'isHexColor': 'hexcolor',
    'isHexadecimal': 'hexadecimal',
    'isIP': 'ip',
    'isISBN': 'isbn',
    'isISSN': 'issn',
    'isISIN': 'isin',
    'isISO8601': 'iso8601',
    'isISO31661Alpha2': 'iso31661alpha2',
    'isISRC': 'isrc',
    'isIn': 'in',
    'isInt': 'int',
    'isJSON': 'json',
    'isLatLong': 'latlong',
    'isLength': 'length',
    'isLowercase': 'lowercase',
    'isMACAddress': 'macaddress',
    'isMD5': 'md5',
    'isMimeType': 'mimetype',
    'isMobilePhone': 'mobilephone',
    'isMongoId': 'mongoid',
    'isMultibyte': 'multibyte',
    'isNumeric': 'numeric',
    'isPort': 'port',
    'isPostalCode': 'postalcode',
    'isSurrogatePair': 'surrogatepair',
    'isURL': 'url',
    'isUUID': 'uuid',
    'isUppercase': 'uppercase',
    'isVariableWidth': 'variablewidth',
    'isWhitelisted': 'whitelisted',
    'matches': 'matches',
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
                    if (!validator[key].apply(validator, [value].concat(args))) {
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