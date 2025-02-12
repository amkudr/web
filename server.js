const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { connectMongoDB } = require('./config/db');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing request bodies and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const favoritesRoutes = require('./routes/favoritesRoutes');
const linksRoutes = require('./routes/linksRoutes');
const usersRoutes = require('./routes/usersRoutes');

//Connect to DB
connectMongoDB();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// API Routes
app.use('/favorites', favoritesRoutes);
app.use('/links', linksRoutes);
app.use('/', usersRoutes);


app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null, user: req.session.user || null });
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

app.get('/myFavorites', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const response = await fetch(`http://localhost:3000/favorites`, {
      method: "GET",
      headers: { "Cookie": req.headers.cookie }
    });

    const data = await response.json();
    console.log("Favorites from API:", data.favorites);

    res.render('favorites', {
      user: req.session.user,
      favorites: data.favorites || []
    });
  } catch (error) {
    console.error("Error rendering favorites page:", error);
    res.render('favorites', { user: req.session.user, favorites: [] });
  }
});






