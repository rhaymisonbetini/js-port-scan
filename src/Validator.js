'use strict'

class Validator {
    /**
     * Verify if a given dor is valid by interval
     * @param {number} port 
     * @returns {boolean}
     */
    static validatePortNumber(port) {
        return port < 0 || port >= 65536 ? false : true
    }

    static isIpOrHost(host) {
        return host.includes('www') ? 'host' : 'ip'
    }
}

module.exports = Validator