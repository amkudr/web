class Links {
    static async getMovieLinks(imdbID, username) {
        // return links of a movie
        return [
            {
                "linkID": 1,
                "name": "Netflix",
                "url": "https://netflix.com/movie123",
                "description": "Watch on Netflix",
                "avgRating": 4.5,
                "votes": 10,
                "clicks": 15,
                "imdbID": "tt1234567",
                "isPublic": true,
                "filmname": "The Matrix",
                "username": "JohnDoe"
            },
            {
                "linkID": 2,
                "name": "HBO Max",
                "url": "https://hbomax.com/movie123",
                "description": "Watch on HBO Max",
                "avgRating": 4.8,
                "votes": 20,
                "clicks": 50,
                "imdbID": "tt1234567",
                "isPublic": false,
                "filmname": "The Matrix",
                "username": "JohnDoe"
            }
        ];
    }

    static async addLink(name, url, description, imdbID, isPrivate, filmname, creator) {
        // add a link to a movie
        return {
            "message": "Link added successfully",
            "linkID": 3
        };
    }

    static async removeLink(linkID) {
        // remove a link from a movie
        return "Link removed successfully";
    }

    static async editLink(linkId, name, url, description, isPrivate) {
        // edit a link from a movie
        return "Link edited successfully";
    }

    static async rateLink(linkID, rating) {
        // rate a link from a movie
        return {
            "message": "Link rated successfully",
            "avgRating": 4.7
        }
    };

    static async clickLink(linkID) {
        // click a link from a movie
        return {
            "message": "Link clicked successfully",
            "clicks": 16
        };
    }
}