const type = require('../index')

class Group {
    constructor(id, name) {
        this.id = id
        this.name = name
    }
}

// create a validation rule
const rule = {
    name: type.string().length(20),
    age: type.number().range(18, 30),
    gender: type.number().optional(),
    compay: type.string().when(data => data.name == 'foo'),
    projects: [{
        url: type.string().match(/^https?:\/\//),
        start_time: type.number().min(+new Date(2018, 3, 1)),
        is_finish: type.bool()
    }],
    type: type.oneOf(['user', 'admin']),
    group: type.instanceOf(Group)
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
    ],
    type: 'user',
    group: new Group(1, 'dev')
}

// done
console.log(type.check(data, rule))