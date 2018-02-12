# cnnct - service framework

mainly designed to work with RabbitMQ

### install:

```bash
yarn add cnnct
```

### producer:

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

### consumer:

```javascript
const Cnnct = require("cnnct")

const consumer = new Cnnct("consumer.json")

let done = 0

// fires every time consumer receives task from producer
consumer.receive(packet => {
    let result = {
        value: eval(packet.data.calc),
    }

    // send result back to producer:
    consumer.context(packet).reply(result)
    // or this way: consumer.reply(packet.id, result)

    console.log("tasks processed:", ++done)
})
```

### producer config (producer.json):

```json
{
    "transport": {
        "type": "rabbitmq",
        "conf": {
            "out": {
                "uri": "amqp://user:password@127.0.0.1:5672",
                "queue": {
                    "name": "test_tasks",
                    "conf": {
                        "durable": false
                    }
                }
            },
            "in": {
                "uri": "amqp://user:password@127.0.0.1:5672",
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

### consumer config (consumer.json):

```json
{
    "transport": {
        "type": "rabbitmq",
        "conf": {
            "out": {
                "uri": "amqp://user:password@127.0.0.1:5672",
                "queue": {
                    "name": "test_results",
                    "conf": {
                        "durable": false
                    }
                }
            },
            "in": {
                "uri": "amqp://user:password@127.0.0.1:5672",
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

### notes

you need to run RabbitMQ on localhost listening port 5672 to properly test that example code

you can run as many consumers as you want in this example - RabbitMQ will round-robin tasks among consumers

### producer output:

```
    1 * 1 { value: 1 }
    2 * 2 { value: 4 }
    3 * 3 { value: 9 }
    4 * 4 { value: 16 }
    5 * 5 { value: 25 }
```

### consumer output:

```
    tasks done: 1
    tasks done: 2
    tasks done: 3
    tasks done: 4
    tasks done: 5
```

### restrictions

- you can't use rpc and receive methods inside one service instance
- if you need to produce and consume tasks in single program, create a separate Cnnct instance for each consumer/producer

### coming soon:

- HTTP transport
- redis transport
- other queues probably
