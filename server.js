const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const usersPath = path.join(__dirname, 'data', 'users.json');
const fs = require('fs/promises');


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

// GET route for the register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST route for registration
app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).render('register', { error: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).render('register', { error: 'Passwords do not match.' });
  }

  try {
    // Read existing users from users.json
    const data = await fs.readFile(usersPath, 'utf-8');
    const users = JSON.parse(data);

    // Check if the email is already registered
    if (users.some(user => user.email === email)) {
      return res.status(400).render('register', { error: 'Email is already registered.' });
    }

    // Add the new user (for demonstration, storing plain text passwords)
    users.push({ username, email, password });
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    
    req.session.user = { username, email };
    res.redirect('/main');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).render('register', { error: 'Internal Server Error.' });
  }
});


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


