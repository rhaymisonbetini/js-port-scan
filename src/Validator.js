'use strict'

class Validator {

    /**
     * Validate Dorr ranger
     * @param {number} port 
     * @returns {Object}
     */
    static validatorDoor(port) {
        let isDoorValid = this.validatePortNumber(port);
        if (!isDoorValid || !port) {
            return { valid: 0, msg: '', reason: 'The given doors is not valid! Interval must be >= 0 and < 65536' }
        } else {
            return { valid: true };
        }
    }

    /**
     * Verify if a given dor is valid by interval
     * @param {number} port 
     * @returns {boolean}
     */
    static validatePortNumber(port) {
        return port < 0 || port >= 65536 ? false : true
    }

    /**
     * Verify if a given host is a string or ip
     * @param {string} host 
     * @returns string
     */
    static isIpOrHost(host) {
        return host.includes('www') ? 'host' : 'ip'
    }
}

module.exports = Validator