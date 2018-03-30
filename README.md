# type2 - a simple data validator

## Installation
```
npm install type2 --save
```

## Usage
```javascript
const type = require('type2')

// create a validation rule
const rule = {
    type: type.oneOf(['admin', 'user']),
    name: type.string().length(20),
    age: type.number().range(18, 30),
    gender: type.number().optional(),
    company: type.string().when(data => data.name == 'foo'),
    projects: [{
        url: type.string().match(/^https?:\/\//),
        start_time: type.number().min(+new Date(2018, 3, 1)),
        is_finish: type.bool()
    }]
}

// some data need to validate
const data = {
    type: 'admin',
    name: 'bar',
    age: 18,
    gender: null,
    company: null,
    projects: [
        {
            url: 'https://project.example.com/1',
            start_time: Date.now(),
            is_finish: true
        },
        {
            url: 'https://project.example.com/2',
            start_time: Date.now(),
            is_finish: true
        }
    ]
}

// done
console.log(type.check(data, rule))
```

## Plugin

you can also get the power of [validator](https://www.npmjs.com/package/validator) by using the validator plugin:

```javascript
const type = require('type2')
const validator = require('type2/lib/plugin/validator')

// apply a plugin
type.apply(validator)

// create a validation rule
const rule = {
    websites: [{
        url: type.url(),
        bgcolor: type.hexColor()
        fgcolor: type.hexColor()
        email: type.email()
    }]
}

// some data need to validate
const data = {
    websites: [
        {
            url: 'https://project.example.com/1'
            bgcolor: '#ffffff'
            fgcolor: '#000000',
            email: 'project@company.com'
        },
        {
            url: 'https://project.example.com/2'
            bgcolor: '#eeffee'
            fgcolor: '#134f00',
            email: 'project@company.com'
        }
    ]
}

// done
console.log(type.check(data, rule))
```