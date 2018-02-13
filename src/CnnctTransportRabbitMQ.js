//

"use strict"

const amqp = require("amqplib/callback_api")
const uuidV4 = require("uuid")

const CnnctTransportBase = require("./CnnctTransportBase")

module.exports = class extends CnnctTransportBase {
    constructor() {
        super()

        this.rpcMaps = {}

        this.rpcQueue = []
        this.replyQueue = []

        this.started = false
        this.ready = false

        this.in = {}
        this.out = {}
    }

    inIsOut() {
        return (this.conf.in.uri === this.conf.out.uri)
            && (this.conf.in.queue.name === this.conf.out.queue.name)
    }

    rpcMap(correlationId, resolve) {
        this.rpcMaps[correlationId] = resolve
    }

    setProcessor(processor) {
        this.processor = processor
    }

    rpc(task, options) {
        if ( !options.correlationId ) {
            throw Error("rabbitmq rpc requires 'options.correlationId' to be non-empty string")
        }

        if ( this.ready ) {
            let queue = this.conf.out.queue.name
            let bytes = Buffer.from(JSON.stringify(task))

            this.out.channel.sendToQueue(queue, bytes, options)
        } else {
            this.rpcQueue.push([ task, options ])
        }
    }

    reply(msg, result, options) {
        if ( this.ready ) {
            let queue = msg.properties.replyTo || this.conf.out.queue.name
            let bytes = Buffer.from(JSON.stringify(result))

            if ( msg.properties.correlationId ) {
                options.correlationId = msg.properties.correlationId
            }

            this.out.channel.sendToQueue(queue, bytes, options)
        } else {
            this.replyQueue.push([ msg, result, options ])
        }
    }

    start() {
        if ( this.started ) { return }
        this.started = true

        let promises = []

        promises.push(this.initChannel("in"))

        if ( this.inIsOut() ) {
            this.out = this.in
        } else {
            promises.push(this.initChannel("out"))
        }

        Promise.all(promises).then(() => {
            this.ready = true

            if ( this.rpcQueue.length ) {
                this.rpcQueue.forEach(([ task, options ]) => this.rpc(task, options))
                this.rpcQueue = []
            }

            if ( this.replyQueue.length ) {
                this.replyQueue.forEach(([ msg, result, options ]) => this.reply(msg, result, options))
                this.replyQueue = []
            }
        })
    }

    initChannel(type) {
        let conf = this.conf[type]
        let shouldConsume = (type==="in") || this.inIsOut()

        return new Promise((resolve, reject) => {
            amqp.connect(conf.uri, (err, conn) => {
                if ( err ) {
                    throw Error("rabbitmq '"+type+"': connect: " + err.message)
                }

                this[type].connection = conn

                conn.createChannel((err, ch) => {
                    if ( err ) {
                        throw Error("rabbitmq '"+type+"': createChannel: " + err.message)
                    }

                    this[type].channel = ch

                    ch.assertQueue(conf.queue.name, conf.queue.conf)

                    if ( shouldConsume ) {
                        ch.consume(conf.queue.name, this.receive.bind(this), { noAck:true })
                    }

                    resolve(this[type])
                })
            })
        })
    }

    receive(msg) {
        let correlationId = msg.properties.correlationId
        let packet = JSON.parse(msg.content.toString())

        if ( this.processor ) {
            this.processor(packet, msg) // packet is task
        } else if ( correlationId && this.rpcMaps[correlationId] ) {
            this.rpcMaps[correlationId](packet, msg) // packet is result
            delete this.rpcMaps[correlationId]
        }
    }
}
