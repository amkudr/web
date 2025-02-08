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

    // static async isExist(username) {
    //     const users = await User.loadUsers();
    //     return users[username] ? true : false;
    // }

    static async login(username, password) {
        const users = await User.loadUsers();
        const user = users[username];
        if (!user || user.password !== password) return null;

        return user;
    }

    //   async toggleFavorite(imdbID, title, poster, year) {
    //     const users = await User.loadUsers();
    //     const user = users[this.username];

    //     if (!user.favorites) user.favorites = [];

    //     const index = user.favorites.findIndex(fav => fav.imdbID === imdbID);
    //     let message;

    //     if (index >= 0) {
    //       user.favorites.splice(index, 1);
    //       message = "Removed from favorites";
    //     } else {
    //       user.favorites.push({ imdbID, title, poster, year });
    //       message = "Added to favorites";
    //     }

    //     await User.saveUsers(users);
    //     return message;
    //   }
}

module.exports = User;
