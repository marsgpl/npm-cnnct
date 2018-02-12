//

"use strict"

const Cnnct = require("../cnnct")

const producer = new Cnnct("producer.json")
const consumer = new Cnnct("consumer.json")

let send = function(i) {
    let task = {
        calc: i+" * "+i,
    }

    producer.rpc(task).then(result => {
        console.log(i, task.calc, result)
        send(i+1)
    })
}

send(1)

consumer.receive(packet => {
    let result = {
        value: eval(packet.data.calc),
    }

    consumer.context(packet).reply(result)
})
