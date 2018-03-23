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
    name:   type.string().length(20),
    age:    type.number().range(18, 30),
    gender: type.number().optional(),
    company: type.string().when(data => data.name == 'foo'),
    projects: [{
        url:        type.string().match(/^https?:\/\//),
        start_time: type.number().min(+new Date(2018, 3, 1)),
        is_finish:  type.boolean()
    }]
}

// some data need to validate
const data = {
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