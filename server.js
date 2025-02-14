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

app.get('/topFilms', async (req, res) => {
  try {
    // Fetch film records from your SQL-based endpoint.
    const response = await fetch(`http://localhost:3000/links/public`, {
      method: "GET",
      headers: { "Cookie": req.headers.cookie }
    });
    const data = await response.json();
    let films = data.links;

    const OMDbAPIKey = '13a68afd'; 

    films = await Promise.all(films.map(async film => {
      try {
        const omdbResponse = await fetch(`http://www.omdbapi.com/?i=${film.imdbID}&apikey=${OMDbAPIKey}`);
        const omdbData = await omdbResponse.json();
        film.Poster =
          (omdbData.Response === 'True' && omdbData.Poster && omdbData.Poster !== 'N/A')
            ? omdbData.Poster
            : null;
      } catch (err) {
        console.error(`Error fetching poster for film ${film.imdbID}:`, err);
        film.Poster = null;
      }
      return film;
    }));

    res.render('topFilms', { films: films, user: req.session.user });
  } catch (error) {
    console.error("Error rendering topFilms page:", error);
    res.render('topFilms', { films: [], user: req.session.user });
  }
});


app.get('/admin', async (req, res) => {
  
  try {
    // Fetch all public links from the database or API
    const response = await fetch(`http://localhost:3000/links/public`, {
      method: "GET",
      headers: { "Cookie": req.headers.cookie }
    });

    const data = await response.json();
    
    // Render the admin panel with the links data
    res.render('admin', { links: data.links });

  } catch (error) {
    console.error("Error fetching links:", error);
    
    // Render the page with an empty links array in case of error
    res.render('admin', { links: [] });
  }
});

// Route to delete a link
app.delete('/admin/delete/:linkID', async (req, res) => {
  try {
    const { linkID } = req.params;
    
    // Send a DELETE request to remove the link
    await fetch(`http://localhost:3000/links/${linkID}`, { method: "DELETE",
      headers: { "Cookie": req.headers.cookie }
     });

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});




