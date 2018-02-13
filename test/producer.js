//

"use strict"

const Cnnct = require("../cnnct")

const producer = new Cnnct("producer.json")

let taskIndex = 0

setInterval(() => {
    taskIndex++

    let task = "%n * %n".replace(/%n/g, taskIndex)

    producer.rpc(task).then(result => {
        console.log(task + " = " + result)
    })
}, 1000)
