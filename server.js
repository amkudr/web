const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const User = require('./model/User');
const PublicMovieLinks = require('./model/PublicMovieLinks');
const connectDB = require('./config/db');


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
connectDB();

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

// // return if the movie is favorited by the user
// app.get('/favorites/isFavorite', async (req, res) => {
//   if (!req.session.user) {
//       return res.json({ isFavorite: false });
//   }

//   const { imdbID } = req.query;
//   const username = req.session.user.username;

//   const isFav = await User.isFavorite(imdbID, username);
//   res.json({ isFavorite: isFav });
// });

// // add a movie to the user's favorites
// app.post('/favorites', async (req, res) => {
//   if (!req.session.user) {
//       return res.status(403).json({ message: "You need to log in to add favorites." });
//   }

//   const { imdbID } = req.body;
//   const username = req.session.user.username;

//   const result = await User.addToFavorites(imdbID, username);
//   res.json({ message: result });
// });

// // remove a movie from the user's favorites
// app.delete('/favorites', async (req, res) => {
//   if (!req.session.user) {
//       return res.status(403).json({ message: "You need to log in to remove favorites." });
//   }

//   const { imdbID } = req.body;
//   const username = req.session.user.username;

//   const result = await User.removeFromFavorites(imdbID, username);
//   res.json({ message: result });
// });

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


// get all the links for a movie
app.get('/:movieID/links', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to view links." });
    }

    const { movieID } = req.params;
    const username = req.session.user.username;

    let privateLinks = await User.getMovieLinks(movieID, username);
    let publicLinks = await PublicMovieLinks.getLinks(movieID);

    res.json({ links: { private: privateLinks, public: publicLinks } });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// add a link to a movie
app.post('/favorites/links', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to add links." });
    }

    const { imdbID, name, url, description, isPrivate } = req.body;
    if (!imdbID || !name || !url || isPrivate === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    let result;
    if (isPrivate) {
      const username = req.session.user.username;
      result = await User.addLinkToMovie(imdbID, username, name, url, description);
    }
    else {
      result = await PublicMovieLinks.addLink(imdbID, name, url, description);
    }
    res.json({ message: result });
  } catch (error) {
    console.error("Error adding link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// remove a link from a movie
app.delete('/:movieID/links', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to remove links." });
    }

    const { movieID } = req.params;
    let { index, isPrivate } = req.body;
    if (index === undefined) {
      return res.status(400).json({ message: "Invalid or missing index." });
    }
    let result;

    if (isPrivate) {
      const username = req.session.user.username;
      result = await User.removeLinkFromMovie(movieID, username, index);
    }
    else {
      result = await PublicMovieLinks.removeLink(movieID, index);
    }

    if (result === null) {
      return res.status(404).json({ message: "Link not found or invalid index." });
    }

    res.json({ message: result });

  } catch (error) {
    console.error("Error removing link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// edit a link for a movie
app.put('/:movieID/links', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(403).json({ message: "You need to log in to edit links." });
    }

    const { movieID } = req.params;
    const { index, name, url, description, isPrivate, wasPrivate } = req.body;
    if (index === undefined || !name || !url || isPrivate === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    let result;

    if (isPrivate === wasPrivate) { // If the link is private and stays private or public and stays public
      if (isPrivate) {
        const username = req.session.user.username;
        result = await User.editLinkInMovie(movieID, username, index, name, url, description);
      }
      else { // If the link is public 
        result = await PublicMovieLinks.editLink(movieID, index, name, url, description
        );
      }
    }
    else { // If the link changes from private to public or vice versa
      if (wasPrivate) {
        const username = req.session.user.username;
        result = await User.removeLinkFromMovie(movieID, username, index);
        if (result === "Link removed") {
          result = await PublicMovieLinks.addLink(movieID, name, url, description);
        }
      }
      else {
        result = await PublicMovieLinks.removeLink(movieID, index);
        if (result === "Link removed") {
          const username = req.session.user.username;
          result = await User.addLinkToMovie(movieID, username, name, url, description);
        }
      }
      if (result === null) {
        return res.status(404).json({ message: "Link not found or invalid index." });
      }
    }
    if (result === "Movie is not in favorites" || result === "Link not found") {
      return res.status(404).json({ message: result });
    }

    res.json({ message: result });

  } catch (error) {
    console.error("Error editing link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});