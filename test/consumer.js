//

"use strict"

const Cnnct = require("../cnnct")

const consumer = new Cnnct("consumer.json")

let tasksProcessed = 0

consumer.receive((task, req) => {
    let result = eval(task)

    consumer.context(req).reply(result)

    console.log("tasks processed:", ++tasksProcessed)
})
