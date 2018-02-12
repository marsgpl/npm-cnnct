//

"use strict"

const Cnnct = require("../cnnct")

const producer = new Cnnct("producer.json")

let i = 0

setInterval(() => {
    i++

    let task = {
        calc: i+" * "+i
    }

    producer.rpc(task).then(result => {
        console.log(task.calc, result)
    })
}, 1000)
