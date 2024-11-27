const zmq = require('zeromq');                                    // Module for ZeroMQ connection.

// Title: Get Started
// Source: https://zeromq.org/get-started/?language=nodejs&library=zeromqjs#
// Talk to ZMQ server using ZMQ.
async function getDateReview(movie_string) {
    console.log('Connecting to date_review server…');
  
    //  Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5556');
    await sock.send(movie_string);

    // Receive message back from server.
    const [result] = await sock.receive();
    movie = JSON.parse(result);                // Should be JSON string

    // Parse and return results
    date = movie.Year 
    review = movie.imdbRating 
    return [date, review];
}

// Export functions as node.js modules
module.exports = {getDateReview};