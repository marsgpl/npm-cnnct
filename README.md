# cnnct - service framework

mainly designed to work with RabbitMQ

install:

```bash
yarn add cnnct
```

producer:

```javascript
const Cnnct = require("cnnct")

const producer = new Cnnct("producer.json")

let i = 0

// produce task every second
setInterval(() => {
    i++

    let task = {
        calc: i+" * "+i
    }

    // promise resolves every time rpc is being
    // completed by consumer
    producer.rpc(task).then(result => {
        console.log(task.calc, result)
    })
}, 1000)
```

consumer:

```javascript
const Cnnct = require("cnnct")

const consumer = new Cnnct("consumer.json")

let done = 0

consumer.receive(packet => {
    let result = {
        value: eval(packet.data.calc),
    }

    consumer.context(packet).reply(result)
    // or this way: consumer.reply(packet.id, result)

    console.log("tasks processed:", ++done)
})
```

producer config (producer.json):

```json
{
    "transport": {
        "type": "rabbitmq",
        "conf": {
            "out": {
                "uri": "amqp://user:password@127.0.0.1:55672",
                "queue": {
                    "name": "test_tasks",
                    "conf": {
                        "durable": false
                    }
                }
            },
            "in": {
                "uri": "amqp://user:password@127.0.0.1:55672",
                "queue": {
                    "name": "test_results",
                    "conf": {
                        "durable": false
                    }
                }
            }
        }
    }
}
```

consumer config (consumer.json):

```json
{
    "transport": {
        "type": "rabbitmq",
        "conf": {
            "out": {
                "uri": "amqp://user:password@127.0.0.1:55672",
                "queue": {
                    "name": "test_results",
                    "conf": {
                        "durable": false
                    }
                }
            },
            "in": {
                "uri": "amqp://user:password@127.0.0.1:55672",
                "queue": {
                    "name": "test_tasks",
                    "conf": {
                        "durable": false
                    }
                }
            }
        }
    }
}
```
