//

"use strict"

const Cnnct = require("../cnnct")

const producer = new Cnnct("producer.json")
const consumer = new Cnnct("consumer.json")

let send = function(taskIndex) {
    let task = "%n * %n".replace(/%n/g, taskIndex)

    producer.rpc(task).then(result => {
        console.log(task + " = " + result)
        send(taskIndex + 1)
    })
}

send(1)

consumer.receive((task, req) => {
    let result = eval(task)

    consumer.context(req).reply(result)
})
