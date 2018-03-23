const type = require('../index')

// create a validation rule
const rule = {
    name:   type.string().length(20),
    age:    type.number().range(18, 30),
    gender: type.number().optional(),
    compay: type.string().when(data => data.name == 'foo'),
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
    compay: null,
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