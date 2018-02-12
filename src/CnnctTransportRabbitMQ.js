//

"use strict"

const amqp = require("amqplib/callback_api")
const uuidV4 = require("uuid")

const CnnctTransportBase = require("./CnnctTransportBase")

module.exports = class extends CnnctTransportBase {
    constructor() {
        super()

        this.rpcMaps = {}
        this.sendQueue = []

        this.started = false
        this.ready = false

        this.in = {}
        this.out = {}
    }

    inIsOut() {
        return (this.conf.in.uri === this.conf.out.uri)
            && (this.conf.in.queue.name === this.conf.out.queue.name)
    }

    rpcMap(packetId, resolve) {
        this.rpcMaps[packetId] = resolve
    }

    setProcessor(processor) {
        this.processor = processor
    }

    send(packet) {
        if ( this.ready ) {
            let queue = this.conf.out.queue.name
            let bytes = Buffer.from(JSON.stringify(packet))

            this.out.channel.sendToQueue(queue, bytes)
        } else {
            this.sendQueue.push(packet)
        }
    }

    receive(msg) {
        let packet = JSON.parse(msg.content.toString())

        if ( this.rpcMaps[packet.id] ) {
            this.rpcMaps[packet.id](packet.data)
            delete this.rpcMaps[packet.id]
        } else if ( this.processor ) {
            this.processor(packet)
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

            if ( this.sendQueue.length ) {
                this.sendQueue.forEach(this.send.bind(this))
                this.sendQueue = []
            }
        }).catch(err => {
            throw Error("CnnctTransportRabbitMQ.start: rabbitmq initChannel failed: " + err)
        })
    }

    initChannel(type) {
        let conf = this.conf[type]
        let shouldConsume = (type==="in") || this.inIsOut()

        return new Promise((resolve, reject) => {
            amqp.connect(conf.uri, (err, conn) => {
                if ( err ) {
                    throw Error("CnnctTransportRabbitMQ.initChannel('"+type+"'): amqp connect failed: " + err)
                }

                this[type].connection = conn

                conn.createChannel((err, ch) => {
                    if ( err ) {
                        throw Error("CnnctTransportRabbitMQ.initChannel('"+type+"'): amqp createChannel failed: " + err)
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
}
