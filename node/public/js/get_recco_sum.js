const zmq = require('zeromq');                                    // Module for ZeroMQ connection.

// Title: Get Started
// Source: https://zeromq.org/get-started/?language=nodejs&library=zeromqjs#
// Talk to ZMQ server using ZMQ.
async function getMovieRecSum(movie_string) {
    console.log('Connecting to rec_sum server…');

  
    //  Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5557');
    await sock.send(movie_string);
    
    // Receive message back from server.
    const [result] = await sock.receive();
    movie = JSON.parse(result);                // Should be JSON string
    // console.log(movie);

    // Parse and return results
    overview = movie.overview;
    recommendation = movie.recommendation;
    rec_overview = movie.rec_overview;

    // return [date, review];
    return [overview, recommendation, rec_overview];
}

// Export functions as node.js modules
module.exports = {getMovieRecSum};