const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs/promises');
const favoritesPath = path.join(__dirname, 'data', 'favorites.json');
const User = require('./model/User');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
    const user = await User.register(username, email, password);
    if (!user) {
      return res.status(400).render('register', { error: 'Username already exists.' });
    }
      User.register(username, email, password);
      req.session.user = { username, email };
      res.redirect('/main');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).render('register', { error: 'Internal Server Error.' });
  }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.login(username, password);
    if (!user) {
      return res.render('login', { error: 'Invalid username or password.' });
    }
    req.session.user = user;
    res.redirect('/main');
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

app.get('/favorites/isFavorite', async (req, res) => {
  if (!req.session.user) {
      return res.json({ isFavorite: false });
  }

  const { imdbID } = req.query;
  const username = req.session.user.username;

  const isFav = await User.isFavorite(imdbID, username);
  res.json({ isFavorite: isFav });
});


app.post('/favorites', async (req, res) => {
  if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to add favorites." });
  }

  const { imdbID } = req.body;
  const username = req.session.user.username;

  const result = await User.addToFavorites(imdbID, username);
  res.json({ message: result });
});


app.delete('/favorites', async (req, res) => {
  if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to remove favorites." });
  }

  const { imdbID } = req.body;
  const username = req.session.user.username;

  const result = await User.removeFromFavorites(imdbID, username);
  res.json({ message: result });
});


// app.post('/favorites', async (req, res) => {
//   // Check if the user is logged in
//   if (!req.session.user) {
//     return res.status(403).json({ message: "You need to log in to add favorites." });
//   }
  
//   const { imdbID, title, poster, year } = req.body;
  
//   try {
//     // Read the favorites file; if it doesn't exist, use an empty array
//     let favorites = [];
//     try {
//       const data = await fs.readFile(favoritesPath, 'utf-8');
//       favorites = JSON.parse(data);
//     } catch (err) {
//       favorites = [];
//     }
    
//     // Check if this movie is already favorited by this user
//     const userIdentifier = req.session.user.username; 
//     const existingIndex = favorites.findIndex(fav =>
//       fav.user === userIdentifier && fav.imdbID === imdbID
//     );
    
//     let message = "";
//     if (existingIndex >= 0) {
//       // If found, remove the favorite
//       favorites.splice(existingIndex, 1);
//       message = "Removed from favorites";
//     } else {
      
//       favorites.push({ user: userIdentifier, imdbID, title, poster, year });
//       message = "Added to favorites";
//     }
    
//     // Write the updated favorites array back to the file
//     await fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2));
    
//     return res.json({ message });
//   } catch (error) {
//     console.error("Error updating favorites:", error);
//     return res.status(500).json({ message: "Internal Server Error." });
//   }
// });


