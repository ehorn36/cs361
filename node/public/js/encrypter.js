const zmq = require('zeromq');                                    // Module for ZeroMQ connection.

// Title: Get Started
// Source: https://zeromq.org/get-started/?language=nodejs&library=zeromqjs#
// Talk to ZMQ server using ZMQ.
async function custom_encryption(json) {
    console.log('Connecting to encryption server…');
  
    //  Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5558');

    // Convert json object into string
    json_string = JSON.stringify(json);
    
    await sock.send(json_string);
    const [result] = await sock.receive();
    parsedData = JSON.parse(result)
    return parsedData;
}

// Export functions as node.js modules
module.exports = {custom_encryption};