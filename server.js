const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const usersPath = path.join(__dirname, 'data', 'users.json');
const fs = require('fs/promises');
const favoritesPath = path.join(__dirname, 'data', 'favorites.json');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null, user: req.session.user || null });
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
    if (username === 'asd' && password === 'asd') {
      req.session.user = { username: username }; 
      res.redirect('/main');
    } else {
      res.render('login', { error: 'Invalid username or password.' });
    }
});

// Route to render the movie search page (main.ejs)
app.get('/main', (req, res) => {
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
  res.render('details', { user: req.session.user || null, details: null, isFavorite: false });
});

app.post('/favorites', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(403).json({ message: "You need to log in to add favorites." });
  }
  
  const { imdbID, title, poster, year } = req.body;
  
  try {
    // Read the favorites file; if it doesn't exist, use an empty array
    let favorites = [];
    try {
      const data = await fs.readFile(favoritesPath, 'utf-8');
      favorites = JSON.parse(data);
    } catch (err) {
      favorites = [];
    }
    
    // Check if this movie is already favorited by this user
    const userIdentifier = req.session.user.username; 
    const existingIndex = favorites.findIndex(fav =>
      fav.user === userIdentifier && fav.imdbID === imdbID
    );
    
    let message = "";
    if (existingIndex >= 0) {
      // If found, remove the favorite
      favorites.splice(existingIndex, 1);
      message = "Removed from favorites";
    } else {
      
      favorites.push({ user: userIdentifier, imdbID, title, poster, year });
      message = "Added to favorites";
    }
    
    // Write the updated favorites array back to the file
    await fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2));
    
    return res.json({ message });
  } catch (error) {
    console.error("Error updating favorites:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});


