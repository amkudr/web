const { linkDB } = require('../config/db'); // Import SQLite connection

class Links {
    /**
     * Get all links for a specific movie.
     * Example response:
    {
        "links": [
            {
            "linkID": 3,
            "name": "Kekflix",
            "url": "https://kekflix.com/movie123",
            "description": "Watch on Netflix",
            "avgRating": null,
            "votes": 1,
            "clicks": 0,
            "imdbID": "tt1234567",
            "isPrivate": 1,
            "filmname": "The Matrix",
            "creator": "First"
            }
        ]
    }
     */
    static async getMovieLinks(imdbID, username) {
        return new Promise((resolve, reject) => {
            linkDB.all(
                "SELECT * FROM Links WHERE imdbID = ? AND (isPrivate = 0 OR creator = ?)",
                [imdbID, username],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
    /**
     * 
     * @returns all public links
     */
    static async getPublicMovieLinks() {
        return new Promise((resolve, reject) => {
            linkDB.all(
                "SELECT * FROM Links WHERE isPrivate = 0",
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    /**
     * Add a new link.
     * Example response:
     * {
     *   "message": "Link added successfully",
     *   "linkID": 3
     * }
     */
    static async addLink(name, url, description, imdbID, isPrivate, filmname, creator) {
        return new Promise((resolve, reject) => {
            linkDB.run(
                "INSERT INTO Links (name, url, description, imdbID, isPrivate, filmname, creator) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, url, description, imdbID, isPrivate, filmname, creator],
                function (err) {
                    if (err) reject(err);
                    else resolve({ message: "Link added successfully", linkID: this.lastID });
                }
            );
        });
    }

    /**
     * Remove a link by ID.
     * Example response:
     * {
     *   "message": "Link removed successfully"
     * }
     */
    static async removeLink(linkID) {
        console.log(linkID);
        return new Promise((resolve, reject) => {
            linkDB.run("DELETE FROM Links WHERE linkID = ?", [linkID], function (err) {
                if (err) reject(err);
                else resolve({ message: "Link removed successfully" });
            });
        });
    }

    /**
     * Edit an existing link.
     * Example response:
     * {
     *   "message": "Link edited successfully"
     * }
     */
    static async editLink(linkID, name, url, description, isPrivate) {
        return new Promise((resolve, reject) => {
            linkDB.run(
                "UPDATE Links SET name = ?, url = ?, description = ?, isPrivate = ? WHERE linkID = ?",
                [name, url, description, isPrivate, Number(linkID)],
                function (err) {
                    if (err) reject(err);
                    else resolve({ message: "Link edited successfully", changes: this.changes });
                }
            );
        });
    }


    /**
     * Rate a link.
     * Example response:
     * {
     *   "message": "Link rated successfully",
     *   "avgRating": 4.7
     * }
     */
    static async rateLink(linkID, rating) {
        return new Promise((resolve, reject) => {
            linkDB.get("SELECT avgRating, votes FROM Links WHERE linkID = ?", [Number(linkID)], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    reject(new Error("Link not found"));
                    return;
                }

                const newVotes = row.votes + 1;
                const newAvgRating = ((row.avgRating * row.votes) + Number(rating)) / newVotes;

                linkDB.run("UPDATE Links SET avgRating = ?, votes = ? WHERE linkID = ?",
                    [newAvgRating, newVotes, Number(linkID)],
                    function (updateErr) {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve({
                                message: "Link rated successfully",
                                avgRating: newAvgRating
                            });
                        }
                    }
                );
            });
        });
    }

    /**
     * Increment the click count for a link.
     * Example response:
     * {
     *   "message": "Link clicked successfully",
     *   "clicks": 16
     * }
     */
    static async clickLink(linkID) {
        return new Promise((resolve, reject) => {
            linkDB.get("SELECT clicks FROM Links WHERE linkID = ?", [Number(linkID)], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    reject(new Error("Link not found"));
                    return;
                }

                const newClicks = row.clicks + 1;

                linkDB.run("UPDATE Links SET clicks = ? WHERE linkID = ?",
                    [newClicks, Number(linkID)],
                    function (updateErr) {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve({
                                message: "Link clicked successfully",
                                clicks: newClicks
                            });
                        }
                    }
                );
            });
        });
    }
}

module.exports = Links;
