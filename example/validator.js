const type = require('../index')
const validator = require('../lib/plugin/validator')

// apply a plugin
type.apply(validator)

// create a validation rule
const rule = {
    websites: [{
        url: type.url(),
        bgcolor: type.hexcolor(),
        fgcolor: type.hexcolor(),
        email: type.email()
    }]
}

// some data need to validate
const data = {
    websites: [
        {
            url: 'https://project.example.com/1',
            bgcolor: '#ffffff',
            fgcolor: '#000000',
            email: 'project@company.com'
        },
        {
            url: 'https://project.example.com/2',
            bgcolor: '#eeffee',
            fgcolor: '#134f00',
            email: 'project@company.com'
        }
    ]
}

// done
console.log(type.check(data, rule))