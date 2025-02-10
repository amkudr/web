const fs = require('fs/promises');
const path = require('path');

const publicLinksPath = path.join(__dirname, '../data/pubMovLinks.json');

class PublicMovieLinks {
    constructor(imdbID, links = []) {
        this.imdbID = imdbID;
        this.links = links; //structure: { imdbID: [{ name, url, description }] }
    }

    static async loadLinks() {
        try {
            const data = await fs.readFile(publicLinksPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading links data:', error);
            return {};
        }
    }

    static async saveLinks(links) {
        await fs.writeFile(publicLinksPath, JSON.stringify(links, null, 2));
    }

    static async getLinks(imdbID) {
        const links = await PublicMovieLinks.loadLinks();
        return links[imdbID] || [];
    }

    static async addLink(imdbID, name, url, description) {
        const links = await PublicMovieLinks.loadLinks();
        if (!links[imdbID]) {
            links[imdbID] = [];
        }

        links[imdbID].push({ name, url, description });
        await PublicMovieLinks.saveLinks(links);
        return "Link added";
    }

    static async editLink(imdbID, index, name, url, description) {
        const links = await PublicMovieLinks.loadLinks();
        const link = links[imdbID][index];
        if (!link) return "Link not found";

        link.name = name;
        link.url = url;
        link.description = description;

        await PublicMovieLinks.saveLinks(links);
        return "Link edited";
    }

    static async removeLink(imdbID, index) {
        const links = await PublicMovieLinks.loadLinks();
        if (!links[imdbID] || !links[imdbID][index]) return "Link not found";

        links[imdbID].splice(index, 1);
        await PublicMovieLinks.saveLinks(links);
        return "Link removed";
    }

}

module.exports = PublicMovieLinks;
