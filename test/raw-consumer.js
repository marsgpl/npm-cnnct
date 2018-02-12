//

"use strict"

const Cnnct = require("../cnnct")

const consumer = new Cnnct("consumer.json")

let done = 0

consumer.receiveRaw(msg => {
    let packet = JSON.parse(msg.content.toString())

    packet = {
        id: packet.id,
        data: {
            value: eval(packet.data.calc),
        },
    }

    consumer.replyRaw(msg, packet)

    console.log("tasks done:", ++done)
})
