const API_KEY = "13a68afd";
const BASE_URL = "http://www.omdbapi.com/";

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
      console.error("Failed to fetch movie details:", error.message);
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
    await renderMovieDetails(movieDetails);
    await loadLinks(imdbID);
  }
});

/**
 * Render movie details on the page.
 * @param {object} details - The movie details object.
 */
async function renderMovieDetails(details) {
  const detailsContainer = document.getElementById("movie-details");

  // Check if the movie in favorites
  let isFavorite = false;
  const response = await fetch(`/favorites/isFavorite?imdbID=${details.imdbID}`);
  const result = await response.json();
  isFavorite = result.isFavorite;
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
            <button class="btn favorite-btn" 
              data-imdbid="${details.imdbID}"
              style="background-color: ${isFavorite ? '#f44336' : '#4CAF50'}; border: none; color: white;">
              ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
      ${isFavorite ? `
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
      ` : ''}
    </div>
    <button class="btn btn-secondary" onclick="goBack()" style="background-color: rgb(128, 128, 128); border: none; color: white; position: absolute; bottom: 10px; right: 10px;">&larr; Back</button>
  </div>
`;
  setTimeout(() => {
    document.querySelector(`.favorite-btn[data-imdbid="${details.imdbID}"]`)
      .addEventListener("click", function () {
        toggleFavorite(details.imdbID, this);
      });
  }, 0);
}

/**
 * Redirects the user to the main page.
 */
function goBack() {
  window.location.href = "/main";
}

/**
 * Toggles the favorite status of a movie by sending a request to the server.
 * Updates the button text and color based on the new status.
 */
async function toggleFavorite(imdbID, button) {
  try {
    const method = button.textContent.includes("Remove") ? "DELETE" : "POST";
    
    await fetchJSON("/favorites", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imdbID })
    });

    // Update the button text and color
    button.textContent = method === "POST" ? "Remove from Favorites" : "Add to Favorites";
    button.style.backgroundColor = method === "POST" ? "#f44336" : "#4CAF50";

    const movieDetails = await MovieAPI.fetchMoviesDetails(imdbID);
    await renderMovieDetails(movieDetails);

  } catch (error) {
    console.error("Error updating favorites:", error);
    Swal.fire("Error", error.message, "error");
  }
}

/**
 * Asynchronously loads and displays a list of links for a given IMDb ID.
 * Fetches the links from the server and populates the HTML element with ID 'links-list'.
 * Each link includes an edit and remove button.
 *
 * @param {string} imdbID - The IMDb ID for which to load the links.
 * @returns {Promise<void>} - A promise that resolves when the links have been loaded and displayed.
 */
async function loadLinks(imdbID) {
  try {
    const linksList = document.getElementById("links-list");
    if (!linksList) {
      console.error("Error: Element with ID 'links-list' not found.");
      return;
    }
    linksList.innerHTML = '';
    const { links } = await fetchJSON(`/${imdbID}/links`);
    links.forEach((link, index) => {
      const listItem = `
        <li>
          ${link.name}: <a href="${link.url}" target="_blank">${link.url}</a>
          <div>${link.description}</div>
          <button class="btn btn-warning btn-sm" onclick="editLink('${imdbID}', '${index}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="removeLink('${imdbID}', '${index}')">Remove</button>
        </li>
      `;
      linksList.insertAdjacentHTML('beforeend', listItem);
    });

  } catch (error) {
    console.error("Failed to load links:", error);
    document.getElementById("links-list").innerHTML = `<li class="text-danger">Error loading links</li>`;
  }
}


/**
 * Displays a SweetAlert2 modal to add a new link associated with a given IMDb ID.
 * Prompts the user to enter the link name, URL, and description.
 * Validates the input and sends a POST request to add the link to the server.
 * Displays success or error messages based on the outcome of the request.
 *
 * @param {string} imdbID - The IMDb ID associated with the link to be added.
 * @returns {Promise<void>} A promise that resolves when the link is added or the operation is cancelled.
 */
async function addLink(imdbID) {
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
        name: document.getElementById('link-name').value.trim(),
        url: document.getElementById('link-url').value.trim(),
        description: document.getElementById('link-description').value.trim()
      };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { name, url, description } = result.value;

      if (!name || !url) {
        Swal.fire("Error", "Name and URL are required!", "error");
        return;
      }

      try {
        const response = await fetch("/favorites/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imdbID, name, url, description })
        });

        if (!response.ok) {
          const errorData = await response.json();
          Swal.fire("Error", errorData.message || "Failed to add link", "error");
          return;
        }

        Swal.fire("Success", "Link added successfully", "success");
        await loadLinks(imdbID);

      } catch (error) {
        console.error("Error adding link:", error);
        Swal.fire("Error", "An unexpected error occurred", "error");
      }
    }
  });
}

/**
 * Edits a link associated with a given IMDb ID.
 *
 * This function fetches the current link data, displays a modal for editing,
 * and updates the link on the server if the user confirms the changes.
 *
 * @param {string} imdbID - The IMDb ID associated with the link.
 * @param {number} index - The index of the link to be edited.
 * @returns {Promise<void>} - A promise that resolves when the link is edited.
 */
async function editLink(imdbID, index) {
  const response = await fetch(`/${imdbID}/links`);
  if (!response.ok) {
    Swal.fire("Error", "Failed to load links", "error");
    return;
  }
  const link = (await response.json()).links[index];

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
  }).then(async (result) => {
    if (result.isConfirmed) {

      const { name, url, description } = result.value;
      const response = await fetch(`/${imdbID}/links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, name, url, description })
      });
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Failed to update link", "error");
        return;
      }
      Swal.fire("Success", "Link updated successfully", "success");
      await loadLinks(imdbID);
    }
  });
}

/**
 * Prompts the user to confirm the removal of a link, and if confirmed,
 * sends a DELETE request to remove the link from the server.
 * 
 * @param {string} imdbID - The IMDb ID of the item to which the link belongs.
 * @param {number} index - The index of the link to be removed.
 * @returns {Promise<void>} A promise that resolves when the link is removed and the links are reloaded.
 */
async function removeLink(imdbID, index) {
  Swal.fire({
    title: "Remove Link",
    text: "Are you sure you want to remove this link?",
    showCancelButton: true,
    confirmButtonText: "Remove",
    confirmButtonColor: "#f44336"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetchJSON(`/${imdbID}/links`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index })
        });

        Swal.fire("Success", "Link removed successfully", "success");
        await loadLinks(imdbID);

      } catch (error) {
        console.error("Error removing link:", error);
        Swal.fire("Error", "An unexpected error occurred", "error");
      }
    }
  });
}

/**
 * Fetches JSON data from a given URL with optional fetch options.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {Object} [options={}] - Optional fetch options.
 * @returns {Promise<Object>} - A promise that resolves to the JSON data.
 * @throws {Error} - Throws an error if the fetch operation fails or the response is not ok.
 */
async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    Swal.fire("Error", error.message, "error");
    throw error; // Rethrow the error to handle it in specific cases
  }
}
