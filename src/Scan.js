'use strict'

const net = require('net');
const dgram = require('dgram');
const Q = require('q');
const dns = require('dns');
const { exec } = require("child_process");
const Validator = require('./validator')
const moment = require('moment');
class Scan {

    /**
    * This method scanner a host with a interval for a inital end final given ports.
* A loopg was created to scanning the interval with handShakeTcp method.
     * Depens on your connetion and powers.
     * @param {string} host 
     * @param {number} init 
     * @param {number} end 
     * @param {boolean} consoler display results in console
     * @returns {Array<Object>}
     */
    async scanPorts(host, init = 0, end = 1000, consoler = false) {
        if (end < init) {
            return 'The final Door needs to be less or equal the inital door';
        }
        let report = []
        let reportConnected = [];
        let reportRefused = [];
        consoler ? console.log('[SCAN-INIT] - SCAN WAS CREATED') : null
        let initalTimer = moment().format('YYYY-MM-DD HH:mm:ss')
        for (let scanner = init; scanner <= end; scanner++) {
            consoler ? console.log(`[SCANING - PORT ${scanner}]`) : null
            let scan = await this.handShakeTcp(scanner, host);
            if (scan.connected) {
                reportConnected.push(scan)
            } else {
                reportRefused.push(scan)
            }

        }
        consoler ? console.log('[SCAN-ENDS] - SCAN WAS FINISHED') : null
        let endTimer = moment().format('YYYY-MM-DD HH:mm:ss')
        report.push({
            init: initalTimer,
            end: endTimer
        })
        report.push(reportConnected);
        report.push(reportRefused);
        return report
    }


    /**
     * this handShake make a tcp connection to a given host and port
     * @param {number} port Port should be >= 0 and < 65536
     * @param {string} host ip or dns
     * @param {boolean} consoler display results in console
     * @returns {Promise<{ connected: 0, msg: '', reason: '' }>}
     */
    async handShakeTcp(port, host, consoler = false) {
        let isValid = Validator.validatorDoor(port);
        if (!isValid.valid) {
            return isValid;
        }
        const socket = new net.Socket();
        socket.connect(port, host);
        let response = { connected: 0, msg: '', reason: '' }
        response = await new Promise((resolve, reject) => {
            socket.on('connect', async () => {
                response.connected = true;
                response.msg = `Established a TCP connection with ${host}:${port}`
                consoler ? console.log(response) : null;
                resolve(response);
            });

            socket.on('error', async (error) => {
                response.connected = false;
                response.msg = `Erro to established a TCP connection with ${host}:${port}`
                response.reason = error.message.indexOf('ECONNREFUSED') !== -1 ?
                    'ECONNREFUSED' : error.message.indexOf('EHOSTUNREACH') !== -1 ?
                        'EHOSTUNREACH' : error.message.indexOf('ETIMEDOUT') !== -1 ?
                            'ETIMEDOUT' : null

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
     * @returns {Promise<any>}
     */
    async udpScanner(port, host, stringBytes = null) {
        let isValid = Validator.validatorDoor(port);
        if (!isValid.valid) {
            return isValid;
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

    /**
     * create ip ping tracer with a 4 call
     * @param {string} host
     * @param {number} ttl
     * @returns {string}
     */
    async ipTracer(host) {
        let isHost = Validator.isIpOrHost(host);
        if (isHost == 'host') {
            host = await this.getIpByHost(host);
        }
        return new Promise((resolve, reject) => {
            exec(`ping ${host}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message)
                }
                resolve(stdout)
            });
        })
    }

    /**
     * This function retuns a ipv4 for a given host
     * @param {string} host 
     * @returns {string}
     */
    async getIpByHost(host) {
        const options = {
            family: 4,
            hints: dns.ADDRCONFIG | dns.V4MAPPED,
        };
        let ip = null
        ip = await new Promise((resolve, reject) => {
            dns.lookup(host, options, (err, address, family) => {
                resolve(address)
            }, err => reject(err));
        }).catch((_) => {
            return err
        })
        return ip;
    }

    /**
    * This function retuns a ipv4 for a given host
    * @param {string} host 
    * @returns {string}
    */
    async getHostByIp(host, port) {
        let isValid = Validator.validatorDoor(port);
        if (!isValid.valid) {
            return isValid;
        }
        let hostName = await new Promise((resolve, reject) => {
            dns.lookupService(host, port, (err, hostname, service) => {
                resolve(hostname)
            });
        }).catch(erro => {
            reject(erro);
        })
        return hostName;
    }
}

module.exports = Scan;