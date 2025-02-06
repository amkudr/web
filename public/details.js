// public/details.js

const API_KEY = "13a68afd"; // Replace with your actual OMDb API key if needed
const BASE_URL = "http://www.omdbapi.com/";

// Define a minimal MovieAPI with the fetchMoviesDetails method.
class MovieAPI {
  static async fetchMoviesDetails(imdbID) {
    try {
      const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}`);
      const movieDetails = await response.json();
      if (movieDetails.Response === "True") {
        movieDetails.trailerURL = `https://www.imdb.com/title/${imdbID}/videogallery`;
        return movieDetails;
      } else {
        Swal.fire("Error", movieDetails.Error, "error");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch movie details:", error);
      Swal.fire("Error", "Failed to fetch movie details. Please try again.", "error");
      return null;
    }
  }
}

// When the DOM content is loaded, get the imdbID from the URL and load the movie details.
document.addEventListener("DOMContentLoaded", async function () {
  const imdbID = new URLSearchParams(window.location.search).get('imdbID');
  if (!imdbID) {
    Swal.fire("Error", "Invalid IMDb ID", "error");
    return;
  }

  const movieDetails = await MovieAPI.fetchMoviesDetails(imdbID);
  if (movieDetails) {
    renderMovieDetails(movieDetails);
    loadLinks(movieDetails.imdbID);
  }
});

function renderMovieDetails(details) {
  const detailsContainer = document.getElementById("movie-details");
  const isFavorite = isMovieInFavorites(details.imdbID);
  const storedLinks = details.links || [];

  detailsContainer.innerHTML = `
    <div class="card" style="max-width: 800px; margin: auto; background-color: rgb(39, 34, 34); border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); color: white; position: relative;">
      <div class="card-body">
        <div class="d-flex">
          <img src="${(details.Poster && details.Poster !== 'N/A') ? details.Poster : '/default-image.jpg'}" alt="${details.Title}" style="width: 150px; height: auto; margin-right: 20px; border-radius: 10px;">
          <div>
            <h2>${details.Title}</h2>
            <p><strong>Released:</strong> ${details.Released}</p>
            <p><strong>Genre:</strong> ${details.Genre}</p>
            <p><strong>Director:</strong> ${details.Director}</p>
            <p><strong>Actors:</strong> ${details.Actors}</p>
            <p><strong>Plot:</strong> ${details.Plot}</p>
            <p><strong>IMDb Rating:</strong> ${details.imdbRating}</p>
            <div class="mt-3">
              <a href="https://www.imdb.com/title/${details.imdbID}" target="_blank" class="btn btn-primary" style="background-color: rgb(255, 215, 0); border: none;">View on IMDb</a>
              <button class="btn" 
                style="background-color: ${isFavorite ? '#f44336' : '#4CAF50'}; border: none; color: white;"
                onclick="toggleFavorite('${details.imdbID}', '${details.Title}', '${details.Poster}', '${details.Year}')">
                ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
        <div id="links-section" class="mt-4">
          <h5>Links</h5>
          <ul id="links-list">
            ${storedLinks.map((link, index) => `
              <li>
                ${link.name}: <a href="${link.url}" target="_blank" style="color: rgb(255, 215, 0);">${link.url}</a>
                <div>${link.description}</div>
                <button class="btn btn-warning btn-sm" onclick="editLink('${details.imdbID}', ${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="removeLink('${details.imdbID}', ${index})">Remove</button>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-success mt-3" style="background-color: rgb(255, 215, 0); border: none;" onclick="addLink('${details.imdbID}')">Add Link</button>
        </div>
      </div>
      <button class="btn btn-secondary" onclick="goBack()" style="background-color: rgb(128, 128, 128); border: none; color: white; position: absolute; bottom: 10px; right: 10px;">&larr; Back</button>
    </div>
  `;
}



function goBack() {
  window.location.href = "/main"; // Adjust this if your main page route differs
}

async function toggleFavorite(imdbID, title, poster, year) {
  try {
    const response = await fetch("/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imdbID, title, poster, year }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("You need to log in to add favorites.");
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Server response:", result);

    const favoriteButton = document.querySelector(`button[onclick*="toggleFavorite('${imdbID}'"]`);
    if (favoriteButton) {
      if (result.message === "Added to favorites") {
        favoriteButton.textContent = "Remove from Favorites";
        favoriteButton.style.backgroundColor = "#f44336";
      } else if (result.message === "Removed from favorites") {
        favoriteButton.textContent = "Add to Favorites";
        favoriteButton.style.backgroundColor = "#4CAF50";
      }
    }
  } catch (error) {
    console.error("Error updating favorites:", error);
    Swal.fire("Error", error.message, "error");
  }
}

function isMovieInFavorites(imdbID) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  return favorites.some(movie => movie.imdbID === imdbID);
}

function loadLinks(imdbID) {
  const linksList = document.getElementById("links-list");
  linksList.innerHTML = '';
  const storedLinks = JSON.parse(localStorage.getItem(`links_${imdbID}`)) || [];

  storedLinks.forEach((link, index) => {
    const listItem = `
      <li>
        ${link.name}: <a href="${link.url}" target="_blank">${link.url}</a>
        <div>${link.description}</div>
        <button class="btn btn-warning btn-sm" onclick="editLink('${imdbID}', ${index})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="removeLink('${imdbID}', ${index})">Remove</button>
      </li>
    `;
    linksList.insertAdjacentHTML('beforeend', listItem);
  });
}

function addLink(imdbID) {
  Swal.fire({
    title: "Add Link",
    html: `
      <input type="text" id="link-name" class="form-control mb-2" placeholder="Link Name">
      <input type="text" id="link-url" class="form-control mb-2" placeholder="Link URL">
      <textarea id="link-description" class="form-control" placeholder="Link Description"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: () => {
      return {
        name: document.getElementById('link-name').value,
        url: document.getElementById('link-url').value,
        description: document.getElementById('link-description').value
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const storedLinks = JSON.parse(localStorage.getItem(`links_${imdbID}`)) || [];
      storedLinks.push(result.value);
      localStorage.setItem(`links_${imdbID}`, JSON.stringify(storedLinks));
      loadLinks(imdbID);
    }
  });
}

function editLink(imdbID, index) {
  const storedLinks = JSON.parse(localStorage.getItem(`links_${imdbID}`)) || [];
  const link = storedLinks[index];

  Swal.fire({
    title: "Edit Link",
    html: `
      <input type="text" id="link-name" class="form-control mb-2" placeholder="Link Name" value="${link.name}">
      <input type="text" id="link-url" class="form-control mb-2" placeholder="Link URL" value="${link.url}">
      <textarea id="link-description" class="form-control" placeholder="Link Description">${link.description}</textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: () => {
      return {
        name: document.getElementById('link-name').value,
        url: document.getElementById('link-url').value,
        description: document.getElementById('link-description').value
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      storedLinks[index] = result.value;
      localStorage.setItem(`links_${imdbID}`, JSON.stringify(storedLinks));
      loadLinks(imdbID);
    }
  });
}

function removeLink(imdbID, index) {
  const storedLinks = JSON.parse(localStorage.getItem(`links_${imdbID}`)) || [];
  storedLinks.splice(index, 1);
  localStorage.setItem(`links_${imdbID}`, JSON.stringify(storedLinks));
  loadLinks(imdbID);
}
