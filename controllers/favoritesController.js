const User = require('../model/User');
const Link = require('../model/Links');

exports.isFavorite = async (req, res) => {
    try {
        const { imdbID } = req.query;
        const username = req.session.user.username;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFav = user.favorites.includes(imdbID);
        res.json({ isFavorite: isFav });
    } catch (error) {
        console.error("Error checking favorite:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addToFavorites = async (req, res) => {
    try {
        const { imdbID } = req.body;
        const username = req.session.user.username;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.favorites.includes(imdbID)) {
            user.favorites.push(imdbID);
            await user.save();
        }

        res.json({ message: "Added to favorites", favorites: user.favorites });
    } catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const { imdbID } = req.body;
        const username = req.session.user.username;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete Links TODO
        // await Link.deleteMany({ imdbID, username });

        user.favorites = user.favorites.filter(id => id !== imdbID);
        await user.save();

        res.json({ message: "Removed from favorites", favorites: user.favorites });
    } catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const username = req.session.user.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error getting favorites:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
