const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the view engine and set the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
  secret: 'your_secret_key', // Change for production
  resave: false,
  saveUninitialized: true,
}));

// Render the login page (adjust as needed)
app.get('/', (req, res) => {
  res.render('login', { error: null });
});

// Login route (example)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Replace this with your actual authentication logic.
    if (username === 'asd' && password === 'asd') {
      req.session.user = { username: username };  // You can add more properties as needed.
      res.redirect('/main');
    } else {
      res.render('login', { error: 'Invalid username or password.' });
    }
});

// Route to render the movie search page (main.ejs)
app.get('/main', (req, res) => {
    // If req.session.user isn't set, pass null (or an empty object) so that the template doesn't throw an error.
    res.render('main', { user: req.session.user || null });
});
  

// Optional logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.get('/details', (req, res) => {
    // Pass the user variable to the template.
    // If the user isn't logged in, you can pass null or an empty object.
    res.render('details', { user: req.session.user || null });
  });
