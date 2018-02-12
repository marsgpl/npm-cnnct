//

"use strict"

const fs = require("fs")

module.exports = class {
    constructor() {
    }

    configure(conf) {
        if ( typeof conf == "object" ) {
            this.conf = conf
        } else {
            this.conf = this.loadConf(conf)
        }

        return this
    }

    loadConf(path) {
        return JSON.parse(fs.readFileSync(path))
    }
}
