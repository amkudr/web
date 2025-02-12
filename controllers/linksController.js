const Links = require('../model/Links');

/**
 * Get all links for a specific movie.
 */
exports.getMovieLinks = async (req, res) => {
    try {
        const { imdbID } = req.params;
        const username = req.session.user.username;
        const links = await Links.getMovieLinks(imdbID, username);
        res.json({ links });
    } catch (error) {
        console.error("Error fetching links:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Get all public links for all movies.
 */

exports.getPublicMovieLinks = async (req, res) => {
    try {
        console.log("getPublicMovieLinks1");
        const links = await Links.getPublicMovieLinks();
        console.log(links);
        res.json({ links });
    } catch (error) {
        console.error("Error fetching links:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Add a new link.
 */
exports.addLink = async (req, res) => {
    try {
        const { imdbID, filmname, name, url, description, isPrivate } = req.body;
        const creator = req.session.user.username;
        const result = await Links.addLink(name, url, description, imdbID, isPrivate, filmname, creator);
        res.json(result);
    } catch (error) {
        console.error("Error adding link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Remove a link by ID.
 */
exports.removeLink = async (req, res) => {
    try {
        const { linkID } = req.params;
        const result = await Links.removeLink(linkID);
        res.json(result);
    } catch (error) {
        console.error("Error removing link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Edit an existing link.
 */
exports.editLink = async (req, res) => {
    try {
        const { linkID } = req.params;
        const { name, url, description, isPrivate } = req.body;
        const result = await Links.editLink(linkID, name, url, description, isPrivate);
        res.json(result);
    } catch (error) {
        console.error("Error editing link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Rate a link.
 */
exports.rateLink = async (req, res) => {
    try {
        const { linkID } = req.params;
        const { rating } = req.body;
        const result = await Links.rateLink(linkID, rating);
        res.json(result);
    } catch (error) {
        console.error("Error rating link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Increment the click count for a link.
 */
exports.clickLink = async (req, res) => {
    try {
        const { linkID } = req.params;
        const result = await Links.clickLink(linkID);
        res.json(result);
    } catch (error) {
        console.error("Error clicking link:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
