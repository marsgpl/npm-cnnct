//

"use strict"

const fs = require("fs")
const uuidV4 = require("uuid")

const CnnctTransportRabbitMQ = require("./CnnctTransportRabbitMQ")

module.exports = class {
    constructor(conf = null) {
        this.uuid = uuidV4()

        if ( conf ) {
            this.configure(conf)
        }
    }

    configure(conf) {
        if ( typeof conf == "object" ) {
            this.conf = conf
        } else {
            this.conf = this.loadConf(conf)
        }

        let transports = {
            rabbitmq: new CnnctTransportRabbitMQ,
        }

        if ( !transports[this.conf.transport.type] ) {
            throw Error("unknown transport type in config: '" + this.conf.transport.type + "'")
        }

        this.transport = transports[this.conf.transport.type]
        this.transport.configure(this.conf.transport.conf)

        return this
    }

    loadConf(path) {
        return JSON.parse(fs.readFileSync(path))
    }

    info() {
        return {
            uuid: this.uuid,
            transport: this.conf.transport.type,
        }
    }

    rpc(task, options = {}) {
        return new Promise((resolve, reject) => {
            options.correlationId = String(options.correlationId || uuidV4())

            this.transport.rpcMap(options.correlationId, resolve)
            this.transport.rpc(task, options)
            this.transport.start()
        })
    }

    receive(processor) {
        this.transport.setProcessor(processor)
        this.transport.start()
    }

    reply(msg, result, options = {}) {
        this.transport.reply(msg, result, options)
    }

    context(msg) {
        return {
            reply: this.reply.bind(this, msg),
        }
    }
}
