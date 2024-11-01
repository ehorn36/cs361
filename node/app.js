
// Define modules.
const express = require('express');           // Module for route handling.
const sqlite3 = require("sqlite3");           // Module for SQLite3 functions.
const session = require('express-session');   // Module to handle user sessions.
const path = require('path');                 // Module to manage file paths.

// start the Express app
const app = express();          
const port = 3000;

// Enable Express to handle HTML form data.
app.use(express.urlencoded({ extended: true }));

// Title: How to handle sessions in Express ?
// Sources: https://www.geeksforgeeks.org/how-to-handle-sessions-in-express/
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
app.get('/home', (req, res) => {

  // If user is already signed-in, retreive session data to pass to homepage. 
  if (req.session.user) {
    res.render('home', { 
      name:     req.session.user.name,
      email:    req.session.user.email, 
      movie:    req.session.user.movie,
      password: req.session.user.password
    });

  // Else, redirect to welcome page.
  } else {
    res.redirect('/');  
  }
});

// Route for the home page for signed-in users.
app.get('/account', (req, res) => {

  // If user is already signed-in, retreive session data to pass to homepage. 
  if (req.session.user) {
    res.render('account', { 
      name:     req.session.user.name,
      email:    req.session.user.email, 
      movie:    req.session.user.movie,
      password: req.session.user.password
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










// *** POST ROUTES ***
// Name: Database integration
// Source: https://expressjs.com/en/guide/database-integration.html

// Name: How to handle form data in Express ?
// Source: https://www.geeksforgeeks.org/how-to-handle-form-data-in-express/

// Name: Node and Express.js Fundamentals - Collecting Form Data with Express
// Source: https://www.youtube.com/watch?v=V9JyBCTcDsg

// Submit registration form.
app.post("/register", (req, res) => {
  const { name, email, movie, password2 } = req.body; // HTML 'name=' fields.

  // db == database defined above.
  db.run("INSERT INTO users (name, email, movie, password) VALUES (?, ?, ?, ?)", [name, email, movie, password2], (err) => {

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

  // db.get == sqlite3 function that retrieves a single row. 
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {

    // If sql returned an error.
    if (err) {
        return res.send('Database error');
    }

    // If sql returned a row.
    if (row) {

      // If password is valid.
      if (password === row.password) {

        // Track data within session: name, email, movie, password
        req.session.user = { 
          name: row.name, 
          email: row.email, 
          movie: row.movie, 
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










// Specify which port we want the server to listen for requests.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}: http://localhost:${port}/`)
})