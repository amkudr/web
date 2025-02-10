const fs = require('fs/promises');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

class User {
    constructor(username, email, password, favorites = {}) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.favorites = favorites; //structure: { imdbID: [{ name, url, description }] }
    }

    static async loadUsers() {
        try {
            const data = await fs.readFile(usersPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading users data:', error);
            return {};
        }
    }

    static async saveUsers(users) {
        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    }

    static async register(username, email, password) {
        const users = await User.loadUsers();
        if (users[username]) return null;
        const newUser = new User(username, email, password);
        users[username] = newUser;

        await User.saveUsers(users);
        return newUser;
    }

    static async login(username, password) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user || user.password !== password) return null;

        return user;
    }

    static async isFavorite(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];
        return Boolean(user && user.favorites[imdbID]);
    }

    static async addToFavorites(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user) return null;

        if (!user.favorites[imdbID]) {
            user.favorites[imdbID] = []; 
            await User.saveUsers(users);
            return "Added to favorites";
        }

        return "Already in favorites";
    }

    static async removeFromFavorites(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];

        if (!user || !user.favorites[imdbID]) return null;

        delete user.favorites[imdbID];
        await User.saveUsers(users);
        return "Removed from favorites";
    }

    static async addLinkToMovie(imdbID, username, linkName, linkURL, linkDescription) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user) return null;

        if (!user.favorites[imdbID]) {
            return "Movie is not in favorites";
        }

        const movieLinks = user.favorites[imdbID];
        if (movieLinks.find(link => link.name === linkName && link.url === linkURL && link.description === linkDescription)) {
            return "Link already exists";
        }

        movieLinks.push({ name: linkName, url: linkURL, description: linkDescription });
        await User.saveUsers(users);
        return "Link added";
    }

    static async removeLinkFromMovie(imdbID, username, index) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user || !user.favorites[imdbID]) return null;
        if (index < 0 || index >= user.favorites[imdbID].length) return null;
        const movieLinks = user.favorites[imdbID];    
        movieLinks.splice(index, 1);
        await User.saveUsers(users);
        return "Link removed";
    }

    static async getMovieLinks(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user || !user.favorites[imdbID]) return [];

        return user.favorites[imdbID];
    }

    static async editLinkInMovie(imdbID, username, index, linkName, linkURL, linkDescription) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user || !user.favorites[imdbID]) return "Movie is not in favorites";

        const movieLinks = user.favorites[imdbID];

        if (index === -1) {
            return "Link not found";
        }

        movieLinks[index] = { name: linkName, url: linkURL, description: linkDescription };
        await User.saveUsers(users);
        return "Link edited";
    }
}

module.exports = User;