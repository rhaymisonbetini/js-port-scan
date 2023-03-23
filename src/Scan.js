'use strict'

const net = require('net');
const dgram = require('dgram');
const Q = require('q');
const ping = require('net-ping');
const Validator = require('./validator')

class Scan {
    /**
     * this handShake make a tcp connection to a giver host and port
     * @param {number} port Port should be >= 0 and < 65536 
     * @param {string} host ip por dns
     * @returns 
     */
    async handShakeTcp(port, host, consoler = false, timeOut) {
        let isDoorValid = Validator.validatePortNumber(port);
        if(!isDoorValid) {
           return { conected: 0, msg: '', reason: 'The given doors is not valid! Interval must be >= 0 and < 65536' }
        }

        const socket = new net.Socket();
        socket.connect(port, host);
        let response = { conected: 0, msg: '', reason: '' }
        response = await new Promise((resolve, reject) => {
            socket.on('connect', async () => {
                response.conected = true;
                response.msg = `Established a TCP connection with ${host}:${port}`
                consoler ? console.log(response) : null;
                resolve(response);
            });

            socket.on('error', async (error) => {
                response.conected = true;
                response.msg = `Erro to established a TCP connection with ${host}:${port}`
                response.reason = error.message.indexOf('ECONNREFUSED') !== -1 ?
                    'Refused' : error.message.indexOf('EHOSTUNREACH') !== -1 ?
                        'Host Unreachable' : error.message.indexOf('ETIMEDOUT') !== -1 ?
                            'Etimedout' : null

                consoler ? console.log(response) : null;
                reject(response);
            });

            socket.on('close', () => {
                consoler ? console.log(`Close connection with ${host}:${port}`) : null;
            })

        }).catch(err => {
            socket.destroy();
            return err
        })
        socket.destroy();
        return response;
    }

    /**
     * This method create a updCall. Upd call do not need return from the destination. 
     * So is not possible verify the return of the connection, only if we have error.
     * @param {number} port 
     * @param {string} host 
     * @param {string} stringBytes 
     * @returns any
     */
    async udpScanner(port, host, stringBytes = null) {
        let isDoorValid = Validator.validatePortNumber(port);
        if(!isDoorValid) {
           return { conected: 0, msg: '', reason: 'The given doors is not valid! Interval must be >= 0 and < 65536' }
        }
        const buffer = new Buffer.from(stringBytes ?? 'UDPScan');
        const socket = dgram.createSocket('udp4');
        let result = { host: host, port: port, type: 'UDP', error: '' };
        let deferred = Q.defer();
        socket.send(buffer, 0, buffer.length, port, host, error => {
            result.error = error;
            deferred.resolve(error);
            socket.close();
        })
        return deferred.promise
    }
}

module.exports = Scan;