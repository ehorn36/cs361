const zmq = require('zeromq');                                    // Module for ZeroMQ connection.

// Title: Get Started
// Source: https://zeromq.org/get-started/?language=nodejs&library=zeromqjs#
// Talk to ZMQ server using ZMQ.
async function fetchMoviePoster(movie_string) {
    console.log('Connecting to poster_fetcher server…');
  
    //  Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5555');
    
    await sock.send(movie_string);
    const [result] = await sock.receive();
    movieURL = result.toString();
    return movieURL;
}

// Export functions as node.js modules
module.exports = {fetchMoviePoster};