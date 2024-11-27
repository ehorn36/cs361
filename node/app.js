// Define modules.
const express = require('express');                               // Module for route handling.
const sqlite3 = require('sqlite3');                               // Module for SQLite3 functions.
const session = require('express-session');                       // Module to handle user sessions.
const path = require('path');                                     // Module to manage file paths.
const {fetchMoviePoster} = require('./public/js/fetch_movie_poster.js');        // Import custom ZeroMQ function
const {getDateReview} = require('./public/js/get_date_review.js');              // Import custom ZeroMQ function
const {getMovieRecSum} = require('./public/js/get_recco_sum.js');                  // Import custom ZeroMQ function
const {isValidImage} = require('./public/js/image_validation.js'); // Import custom image validation function
const {custom_encryption} = require('./public/js/encrypter.js'); // Import custom image validation function

// const { error } = require('console');

// start the Express app
const app = express();          
const port = 3000;

// Enable Express to handle HTML form data.
app.use(express.urlencoded({ extended: true }));

// Title: How to handle sessions in Express ?
// Source: https://www.geeksforgeeks.org/how-to-handle-sessions-in-express/
// Enable express to handle user sessions.
app.use(session({
  secret: 'my_session_key', 
  resave: false,
  saveUninitialized: false,
}));

// Connect to SQLite database file.
const db = new sqlite3.Database(path.join(__dirname, '..', '/database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to database.');
  }
});

// Instantiate the 'ejs' templating engine.
app.set('view engine', 'ejs');

// Define the location of the views folder.
app.set('views', path.join(__dirname, 'views'));

// Define the location of the public directory for css.
app.use(express.static(path.join(__dirname, 'public')));










// *** GET routes ***
// Get welcome / index page.
app.get('/', (req, res) => {

  // If user is already signed-in.
  if (req.session.user) {

    // Redirect to home.
    res.redirect('/home'); 

  // Else, route to welcome page.
  } else {
    res.render('index.ejs');
  }
});

// Route for the home page for signed-in users.
app.get('/home', async (req, res) => {

  // If user is already signed-in, retreive session data to pass to homepage. 
  if (req.session.user) {

    // Fetch movie image.
    movie = req.session.user.movie
    let movieURL = await fetchMoviePoster(movie);
    const validUrl = await isValidImage(movieURL);

    res.render('home', { 
      name:     req.session.user.name,
      email:    req.session.user.email, 
      movie:    req.session.user.movie,
      password: req.session.user.password,
      movieURL: validUrl ? movieURL : null,  
    });

  // Else, redirect to welcome page.
  } else {
    res.redirect('/');  
  }
});

// Route for the home page for signed-in users.
app.get('/account', async (req, res) => {

  // If user is already signed-in, retreive session data to pass to homepage. 
  if (req.session.user) {

    // Fetch movie image.
    let movieURL = await fetchMoviePoster(req.session.user.movie);
    const validUrl = await isValidImage(movieURL);
    console.log(req.session.user.movie);

    // Fetch movie release date and review.
    let dateReview = await getDateReview(req.session.user.movie);
    let releaseDate = dateReview[0];
    let movieReview = dateReview[1];
    console.log(req.session.user.movie);

    // Fetch movie release date and review.
    let movieRecSum = await getMovieRecSum(req.session.user.movie);
    let overview = movieRecSum[0];
    let movieRec = movieRecSum[1];
    let RecSum = movieRecSum[2];
    // let alt_movie = dateReview[1];
    
    res.render('account', { 
      name:     req.session.user.name,
      email:    req.session.user.email, 
      movie:    req.session.user.movie,
      password: req.session.user.password,
      movieURL: validUrl ? movieURL : null,    // If movieURL is invalid, then pass null to rendered file. 
      releaseDate: releaseDate,
      movieReview: movieReview,
      overview: overview,
      movieRec: movieRec,
      RecSum: RecSum
    });

  // Else, redirect to welcome page.
  } else {
    res.redirect('/');  
  }
});

// Get registration page.
app.get('/register', (req, res) => {
  res.render('register.ejs');
})

// Get sign-in page.
app.get('/signin', (req, res) => {
  res.render('signin.ejs');
})

// Get search page.
app.get('/search', (req, res) => {

  // Pass movieURL to search page. 
  res.render('search.ejs', { movieURL: null }); 
});

// Get update page.
app.get('/update', (req, res) => {

  res.render('update.ejs'); 
});






// *** POST ROUTES ***
// Name: Database integration
// Source: https://expressjs.com/en/guide/database-integration.html

// Name: How to handle form data in Express ?
// Source: https://www.geeksforgeeks.org/how-to-handle-form-data-in-express/

// Name: Node and Express.js Fundamentals - Collecting Form Data with Express
// Source: https://www.youtube.com/watch?v=V9JyBCTcDsg

// Submit registration form.
app.post("/register", async (req, res) => {
  const { name, email, movie, password2 } = req.body; // HTML 'name=' fields.

  // Encrypt pass & movie
  let encrypt_movie_json = {
    "encrypt": movie,
    "decrypt": "",
  }

  let encrypt_pass_json = {
    "encrypt": password2,
    "decrypt": "",
  }

  let encrypted_movie = await custom_encryption(encrypt_movie_json); 
  let encrypted_pass = await custom_encryption(encrypt_pass_json); 

  console.log(encrypted_movie);
  console.log(encrypted_pass);


  // db == database defined above.
  db.run("INSERT INTO users (name, email, movie, password) VALUES (?, ?, ?, ?)", [name, email, encrypted_movie, encrypted_pass], (err) => {

    // If error.
    if (err) {
      return res.status(500).send("Error adding user into databse.");
    }

    // Track data within session: name, email, movie, password
    req.session.user = {  
      name: name,           // req.session.user.name == name from form. 
      email: email, 
      movie: movie, 
      password: password2};

    // Return to home page.
    res.redirect('/');

  });
});

// Submit sign-in form.
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  console.log("sign/in about to query DB");

  // db.get == sqlite3 function that retrieves a single row. 
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {

    console.log("sign/in just queried the DB");

    // If sql returned an error.
    if (err) {
        return res.send('Database error');
    }

    // If sql returned a row.
    if (row) {

      // Decrypt pass & movie
      let decrypt_movie_json = {
        "encrypt": "",
        "decrypt": row.movie,
      }

      let decrypt_pass_json = {
        "encrypt": "",
        "decrypt": row.password,
      }

      let decrypted_movie = await custom_encryption(decrypt_movie_json); 
      let decrypted_pass = await custom_encryption(decrypt_pass_json); 

      console.log(password)
      console.log(decrypted_pass)


      // If password is valid.
      if (password === decrypted_pass) {

        // Track data within session: name, email, movie, password
        req.session.user = { 
          id: row.id,
          name: row.name, 
          email: row.email, 
          movie: decrypted_movie, 
          password: row.password};

        // Instantiate user session and redirect to home.
        res.redirect('/home'); 

      } else {
        res.send('Invalid email or password');
      }

  }});
});

// Log out session. 
app.post('/logout', (req, res) => {

  // End user session. 
  req.session.destroy((err) => {
      if (err) {
          console.log('Error logging out:', err);
          return res.send('Error logging out');
      }

      // Redirection back to index / welcome page. 
      res.redirect('/'); 
  });
});

// Search using microservice.
app.post('/search', async (req, res) => {
  
  // Text provided by user via search box form.
  const movie_string = req.body.search;

  // If microservice works.
  try {

    // Store image URL, and render search page while passing in image URL. 
    let movieURL = await fetchMoviePoster(movie_string);  
    console.log(movieURL);

    // Validate movie URL.
    const validUrl = await isValidImage(movieURL);

    // If movieURL is valid, then pass validUrl. Otherwise pass null.
    res.render('search.ejs', {movieURL, validUrl});
  
  // If error, render search page with null movie URL and pass error
  } catch (error) {
    console.error(error);
    res.render('search.ejs', { movieURL: null, error: 'An error occured populating movie image' });
  }
});

// Update favorite movie
app.post('/update', async (req, res)  => {

  // If user is already signed-in, retreive session data to update movie.
  if (req.session.user) {

    const new_movie  = req.body.movie;    // HTML 'name=' fields.
    console.log(new_movie);
    userID = req.session.user.id;         // Session / SQL user ID. 
    req.session.user.movie = new_movie;   // Update session data. 

    movie_update_json_obj = {
      "encrypt": new_movie,
      "decrypt": "",
    }

    encrypted_movie = await custom_encryption(movie_update_json_obj); 

    // db == database defined above.
    db.run("UPDATE users SET movie = ? WHERE id = ?", [encrypted_movie, userID], (err) => {

      // If error.
      if (err) {
        return res.status(500).send("Error updating movie.");
      }

      
      // Return to account page.
      res.redirect('/account');

    });
  }});


// Specify which port we want the server to listen for requests.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}: http://localhost:${port}/`)
})

// async function testFucntion() {

//   please_encrypt_json_obj = {
//     "encrypt": 11111111,
//     "decrypt": "",
//   }

//   please_decrypt_json_obj = {
//     "encrypt": "",
//     "decrypt": "gAAAAABnRl2iEidL5Nxc8FL_nZ6_UCy8BXINFbAAQpLAAKjO2BASsI1kGYJA4uheQAbYA2QfJY2sFnYR_O5yK7-23dvnQGPpDg==",
//   }

//   let encryptMe = await custom_encryption(please_encrypt_json_obj); 
//   console.log(encryptMe);

//   let decryptMe = await custom_encryption(please_decrypt_json_obj); 
//   console.log(decryptMe);

// }
// testFucntion();