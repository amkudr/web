const fs = require('fs/promises');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

class User {
    constructor(username, email, password, favorites = []) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.favorites = favorites;
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
        if (!user.favorites) return false;
        return user.favorites.includes(imdbID);
    }

    static async addToFavorites(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user) return null;

        // Check if movie is already in favorites
        if (!user.favorites.includes(imdbID)) {
            user.favorites.push(imdbID);
            await User.saveUsers(users);
            return "Added to favorites";
        }

        return "Already in favorites";
    }
    static async removeFromFavorites(imdbID, username) {
        const users = await User.loadUsers();
        const user = users[username];

        if (!user || !user.favorites) return null;

        user.favorites = user.favorites.filter(fav => fav !== imdbID);
        await User.saveUsers(users);
        return "Removed from favorites";
    }
}

module.exports = User;
