# service framework

- should help you create network services fast and easy
- mainly designed to work with RabbitMQ
- if you are not familiar in what RabbitMQ is - visit [this resource](http://www.rabbitmq.com/tutorials/tutorial-one-javascript.html)

### install:

```bash
yarn add cnnct
```

### producer:

```javascript
const Cnnct = require("cnnct")

const producer = new Cnnct("producer.json")

let taskIndex = 0

setInterval(() => {
    taskIndex++

    let task = "%n * %n".replace(/%n/g, taskIndex)

    producer.rpc(task).then(result => {
        console.log(task + " = " + result)
    })
}, 1000)
```

### consumer:

```javascript
const Cnnct = require("cnnct")

const consumer = new Cnnct("consumer.json")

let tasksProcessed = 0

consumer.receive((task, req) => {
    let result = eval(task)

    consumer.context(req).reply(result)

    console.log("tasks processed:", ++tasksProcessed)
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

### notes:

- you can pass objects in 'task' and 'reply' variables
- you need to run RabbitMQ on localhost listening port 5672 to properly test that example code
- you can run as many consumers as you want in this example - RabbitMQ will round-robin tasks among consumers

### producer output:

```
    1 * 1 = 1
    2 * 2 = 4
    3 * 3 = 9
    4 * 4 = 16
    5 * 5 = 25
    ...
```

### consumer output:

```
    tasks processed: 1
    tasks processed: 2
    tasks processed: 3
    tasks processed: 4
    tasks processed: 5
    ...
```

### restrictions:

- you can't use 'rpc' and 'receive' methods in the same service instance
- if you need to produce and consume tasks in single program, create a separate Cnnct instance for each consumer/producer

### TODO:

- syn/ack configuration
- timeouts
