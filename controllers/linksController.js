const Links = require('../model/Links');

exports.getMovieLinks = async (req, res) => {
    const { imdbID } = req.params;
    const username = req.session.user.username;
    const links = await Links.getMovieLinks(imdbID, username);
    res.json({ links }); // {linkID(key) name url desc avgRating votes clics imdbID isPrivate filmname creator}
}

exports.addLink = async (req, res) => {
    const { imdbID, filmname, name, url, description, isPrivate } = req.body;
    const creator = req.session.user.username;
    const result = await Links.addLink(name, url, description, imdbID, isPrivate, filmname, creator);
    res.json({ message: result });
}

exports.removeLink = async (req, res) => {
    const { linkID } = req.params;
    const result = await Links.removeLink(linkID);
    res.json({ message: result });
}

exports.editLink = async (req, res) => {
    const { linkId } = req.params;
    const { name, url, description, isPrivate } = req.body;
    const result = await Links.editLink(linkId, name, url, description, isPrivate);
    res.json({ message: result });
}

exports.rateLink = async (req, res) => {
    const { linkID } = req.params;
    const { rating } = req.body;
    const result = await Links.rateLink(linkID, rating);
    res.json({ message: result });
}

exports.clickLink = async (req, res) => {
    const { linkID } = req.params;
    const result = await Links.clickLink(linkID);
    res.json({ message: result });
}

