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
            throw Error("Cnnct.configure: unknown transport type: '" + this.conf.transport.type + "'")
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

    setRole(role) {
        if ( this.role === role ) {
            return
        }

        if ( this.role && this.role !== role ) {
            throw Error("Cnnct.setRole: role was already set; you can't be '"+role+"' and '"+this.role+"' at the same time; do not use methods 'rpc' and 'receive' in the same service")
        }

        this.role = role
    }

    rpc(task) {
        this.setRole("producer")

        return new Promise((resolve, reject) => {
            let packet = {
                id: uuidV4(),
                data: task,
            }

            this.transport.rpcMap(packet.id, resolve)
            this.transport.send(packet)
            this.transport.start()
        })
    }

    receive(processor) {
        this.setRole("consumer")

        this.transport.setProcessor(processor)
        this.transport.start()
    }

    reply(packetId, result) {
        let packet = {
            id: packetId,
            data: result,
        }

        this.transport.send(packet)
    }

    context(packet) {
        return {
            reply: this.reply.bind(this, packet.id),
        }
    }
}
