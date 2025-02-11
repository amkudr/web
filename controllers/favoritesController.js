const User = require('../model/User');

exports.isFavorite = async (req, res) => {
    const { imdbID } = req.query;
    const username = req.session.user.username;
    const isFav = await User.isFavorite(imdbID, username);
    res.json({ isFavorite: isFav });
};

exports.addToFavorites = async (req, res) => {
    const { imdbID } = req.body;
    const username = req.session.user.username;
    const result = await User.addToFavorites(imdbID, username);
    res.json({ message: result });
};

exports.removeFromFavorites = async (req, res) => {
    const { imdbID } = req.body;
    const username = req.session.user.username;
    const result = await User.removeFromFavorites(imdbID, username);
    res.json({ message: result });
};

exports.getFavorites = async (req, res) => {
    res.json({
        favorites: ["tt14596212", "tt0124315", "tt0410297"]
    });
};


// exports.getFavorites = async (req, res) => {
//     const username = req.session.user.username;
//     const user = await User.loadUsers();
//     const favorites = user[username].favorites;
//     res.json({ favorites });
// }