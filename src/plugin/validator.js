const validator = require('validator')
const assert = require('assert')

const api = {
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
}

module.exports = type2 => {
    for (const key in api) {
        assert(key in validator, `validator missing api: ${ key }`)

        type2[api[key]] = (...args) => {
            return {
                __checkable__: api[key],
                
                check: value => {
                    if (!validator[key](value, ...args)) {
                        return { errno: 1000, errmsg: `[validtor] ${ key } error` }
                    }
                }
            }
        }
    }
}