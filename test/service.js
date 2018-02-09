//

"use strict"

const Cnnct = require("../cnnct")

const service = new Cnnct("./service.json")

service.run(task => {
    console.log(new Date, service.info(), task)
})
