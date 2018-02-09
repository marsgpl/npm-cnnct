# cnnct service wrapper

use this npm module to easily create network service

features:
- consume queue to process tasks
- provide health metrics for monitoring systems

install:

```bash
yarn add cnnct
```

use:

```javascript
const Cnnct = require("cnnct")

const service = new Cnnct

service.use("rabbitmq")
service.configure("./service.json")

// fires every time there is a task in broker queue
service.run(task => {
    console.log(new Date, service.info(), task)
})
```

config format:

```json
{
    "transports": {
        "rabbitmq": {...}
    }
}
```
