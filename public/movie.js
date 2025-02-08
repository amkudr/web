// movie.js

const API_KEY = "13a68afd"; 
const BASE_URL = "http://www.omdbapi.com/";

// Movie class to structure movie objects (optional, used for clarity)
class Movie {
    constructor(id, title, year, imdbID, poster) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.imdbID = imdbID;
        this.poster = poster;
    }
}

// MovieAPI class with static methods for fetching and rendering movies
class MovieAPI {
    // Fetch movies based on search query
    static async fetchMovies(query) {
        try {
            const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.Response === "True") {
                // Map the returned movies to Movie objects
                return data.Search.map(
                    (movie) => new Movie(movie.imdbID, movie.Title, movie.Year, movie.imdbID, movie.Poster)
                );
            } else {
                Swal.fire("Error", data.Error, "error");
                return [];
            }
        } catch (error) {
            console.error("Failed to fetch movies:", error);
            Swal.fire("Error", "Failed to fetch movies. Please try again.", "error");
            return [];
        }
    }

    // Render movie cards dynamically
    static renderMovies(movies, container) {
        container.innerHTML = ""; // Clear previous results
        if (movies.length === 0) {
            container.innerHTML = "<p>No movies found. Please try a different search.</p>";
            return;
        }

        movies.forEach((movie) => {
            const cardHTML = `
                <div class="col-md-3 mb-4">
                    <div class="card">
                        <img src="${movie.poster !== "N/A" ? movie.poster : "default-image.jpg"}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.year}</p>
                            <a href="/details?imdbID=${movie.imdbID}" class="btn btn-primary">Details</a>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHTML);
        });
    }
}

document.getElementById("search-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const query = document.getElementById("search-query").value.trim();
    const container = document.getElementById("movies-container");

    if (!query) {
        Swal.fire("Error", "Please enter a search term.", "error");
        return;
    }

    const movies = await MovieAPI.fetchMovies(query);
    MovieAPI.renderMovies(movies, container);
});
