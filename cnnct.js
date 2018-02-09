//

"use strict"

const uuidV4 = require("uuid")

module.exports = class {
    constructor(conf = null) {
        this.uuid = uuidV4()
        this.configure(conf)
    }

    configure(conf) {
        this.conf = conf

        return this
    }

    run(processor) {
        setInterval(() => {
            processor({
                from: "lolo",
                to: "kek",
                data: {
                    noob: true,
                },
            })
        }, 2000)

        return this
    }

    info() {
        return {
            uuid: this.uuid,
        }
    }
}
