//

"use strict"

const Cnnct = require("../cnnct")

const consumer = new Cnnct("./consumer.json")

let done = 0

consumer.receive(packet => {
    let result = {
        value: eval(packet.data.calc),
    }

    consumer.context(packet).reply(result)

    console.log("tasks done:", ++done)
})
