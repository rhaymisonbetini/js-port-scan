'use strict'

const net = require('net');

class Scan {

    /**
     * this handShake make a tcp connection to a giver host and port
     * @param {number} port Port should be >= 0 and < 65536 
     * @param {string} host ip por dns
     * @returns 
     */
    async handShake(port, host) {
        const socket = new net.Socket();
        socket.connect(port, host);
        let response = await new Promise((resolve, reject) => {
            socket.on('connect', async () => {
                console.log(`Established a TCP connection with ${host}:${port}`);
                resolve(`Established a TCP connection with ${host}:${port}`);
                socket.destroy();
            });

            socket.on('error', async () => {
                console.log(`Erro to established a TCP connection with ${host}:${port}`);
                reject(`Erro to established a TCP connection with ${host}:${port}`);
                socket.destroy();
            });

        })
        return response;
    }
}

module.exports = Scan;