const API_KEY = "13a68afd";
const BASE_URL = "https://www.omdbapi.com/";

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
    loadReviews();
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
          </ul>
          <button class="btn btn-success mt-3" style="background-color: rgb(255, 215, 0); border: none;" onclick="addLink('${details.imdbID}', '${details.Title}')">Add Link</button>
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
    
    // Clear the links list before loading new data
    linksList.innerHTML = '';

    // Fetch private and public links
    const { links } = await fetchJSON(`/links/${imdbID}`);
    const privateLinks = links.filter(link => link.isPrivate);
    const publicLinks = links.filter(link => !link.isPrivate);

    // Function to generate HTML for links list
    function renderLinks(links, title) {
      if (!links || links.length === 0) return ''; // Skip if no links available
      let linksHTML = `<h5>${title}</h5><ul class="list-group">`;

      links.forEach((link) => {
        const avgRating = link.avgRating !== null ? link.avgRating.toFixed(1) : "N/A";
        const votes = link.votes || 0;
    
        linksHTML += `

          <li class="list-group-item d-flex justify-content-between align-items-center" data-link-id="${link.linkID}">
            <div>
              <strong>${link.name}</strong>: 
              <a href="${link.url}" target="_blank" rel="noopener noreferrer" onclick="handleLinkClick(event,${link.linkID}, '${link.url}', '${link.imdbID}')" class="link-primary">${link.url}</a>
              <div class="text-muted">${link.description}</div>
            </div>
    
            <div class="d-flex flex-column align-items-center">
              <span class="badge bg-info text-dark">Rating: ${avgRating} (${votes} votes)</span>
              <div class="rating-buttons">
                ${[1, 2, 3, 4, 5].map(rating => `
                  <button class="btn btn-sm btn-outline-primary" onclick="rateLink(${link.linkID}, ${rating}, '${link.imdbID}')">${rating} ⭐</button>
                `).join('')}
              </div>
            </div>
    
            <div>
              <button class="btn btn-warning btn-sm" onclick="editLink('${link.linkID}', '${link.imdbID}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="removeLink('${link.linkID}','${link.imdbID}')">Remove</button>
            </div>

          </li>
        `;
      });
    
      linksHTML += `</ul>`;
      return linksHTML;
    }

    // Build the HTML content only for non-empty lists
    let htmlContent = '';
    htmlContent += renderLinks(privateLinks, "Private Links");
    htmlContent += renderLinks(publicLinks, "Public Links");

    // Insert the generated HTML into the container
    linksList.innerHTML = htmlContent || '<li class="text-muted">No links available</li>';

  } catch (error) {
    console.error("Failed to load links:", error);
    document.getElementById("links-list").innerHTML = `<li class="text-danger">Error loading links</li>`;
  }
}

async function rateLink(linkID, rating, imdbID) {
  try {
    const response = await fetch(`/links/rate/${linkID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating })
    });

    if (!response.ok) throw new Error("Failed to vote");

    Swal.fire("Success", `You rated this link ${rating} stars!`, "success");
    await loadLinks(imdbID);
  } catch (error) {
    console.error("Error voting for link:", error);
    Swal.fire("Error", "Could not submit vote", "error");
  }
}

async function handleLinkClick(event, linkID, url) {
  try {
    event.preventDefault();

    await fetch(`/links/click/${linkID}`, { method: "PUT" });
    window.open(url, "_blank", "noopener noreferrer");

  } catch (error) {
    console.error("Error tracking click:", error);
  }
}


/**
 * Displays a SweetAlert2 modal to add a new link associated with a given IMDb ID.
 * Prompts the user to enter the link name, URL, and description.
 * Validates the input and sends a POST request to add the link to the server.
 * Displays success or error messages based on the outcome of the request.
 *
 * @param {string} imdbID - The IMDb ID associated with the film to be added.
 * @param {string} filmname - The name of the film to be added
 * @returns {Promise<void>} A promise that resolves when the link is added or the operation is cancelled.
 */
async function addLink(imdbID, filmname) {
  Swal.fire({
    title: "Add Link",
    html: `
      <input type="text" id="link-name" class="form-control mb-2" placeholder="Link Name">
      <input type="text" id="link-url" class="form-control mb-2" placeholder="Link URL">
      <textarea id="link-description" class="form-control" placeholder="Link Description"></textarea>
      <div class="mb-2">
        <label class="me-2">Visibility:</label>
        <input type="radio" name="link-visibility" id="private" value="private" checked>
        <label for="private">Private</label>

        <input type="radio" name="link-visibility" id="public" value="public" >
        <label for="public" class="me-2">Public</label>      
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: () => {
      const name = document.getElementById('link-name').value.trim();
      const url = document.getElementById('link-url').value.trim();
      const description = document.getElementById('link-description').value.trim();
      const visibility = document.querySelector('input[name="link-visibility"]:checked')?.value;
    
      if (!name || !url || !description) {
        Swal.showValidationMessage("All fields (Name, URL, and Description) are required!");
        return false;
      }
    
      return { name, url, description, isPrivate: visibility === "private" };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { name, url, description, isPrivate } = result.value;

      if (!name || !url) {
        Swal.fire("Error", "Name and URL are required!", "error");
        return;
      }

      try {
        const response = await fetch("/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imdbID, filmname, name, url, description, isPrivate })
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
 * @returns {Promise<void>} - A promise that resolves when the link is edited.
 */
async function editLink(linkID, imdbID) {
  Swal.fire({
    title: "Edit Link",
    html: `
      <input type="text" id="link-name" class="form-control mb-2" placeholder="Link Name">
      <input type="text" id="link-url" class="form-control mb-2" placeholder="Link URL">
      <textarea id="link-description" class="form-control" placeholder="Link Description"></textarea>
      <div class="mb-2">
        <label class="me-2">Visibility:</label>
        <input type="radio" name="link-visibility" id="private" value="private" checked>
        <label for="private">Private</label>

        <input type="radio" name="link-visibility" id="public" value="public" >
        <label for="public" class="me-2">Public</label>      
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    preConfirm: () => {
      const name = document.getElementById('link-name').value.trim();
      const url = document.getElementById('link-url').value.trim();
      const description = document.getElementById('link-description').value.trim();
      const visibility = document.querySelector('input[name="link-visibility"]:checked')?.value;
    
      if (!name || !url || !description) {
        Swal.showValidationMessage("All fields (Name, URL, and Description) are required!");
        return false;
      }
    
      return { name, url, description, isPrivate: visibility === "private" };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
     
      const { name, url, description, isPrivate } = result.value;
      const response = await fetch(`/links/${linkID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, description, isPrivate })
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
 * @param {string} linkID -  The ID of the link to be removed.
 * @returns {Promise<void>} A promise that resolves when the link is removed and the links are reloaded.
 */
async function removeLink(linkID, imdbID) {
  Swal.fire({
    title: "Remove Link",
    text: "Are you sure you want to remove this link?",
    showCancelButton: true,
    confirmButtonText: "Remove",
    confirmButtonColor: "#f44336"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetchJSON(`/links/${linkID}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
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

// Reviews Section: Load reviews from localStorage
function loadReviews() {
  const reviewsKey = 'reviews_' + imdbID;
  const reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = "";
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = "<div class='col-12 text-center'><p>No reviews yet.</p></div>";
  } else {
    reviews.forEach((review, index) => {
      // Create a column for each review card
      const colDiv = document.createElement("div");
      colDiv.className = "col-12 col-md-6";
      
      // Create the review card
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-username">Reviewed by: ${review.username}</div>
        <div class="review-rating">Rating: ${review.rating} / 5</div>
        <div class="review-text">${review.text}</div>
        <button class="btn btn-danger btn-sm delete-review-btn" onclick="deleteReview(${index})">Delete</button>
      `;
      colDiv.appendChild(card);
      reviewsList.appendChild(colDiv);
    });
  }
}

function addReview() {
  const reviewText = document.getElementById("review-text").value;
  const reviewRating = document.getElementById("review-rating").value;
  
  if (!reviewText || !reviewRating) {
    alert("Please provide both a review and a rating.");
    return;
  }
  
  const reviewsKey = 'reviews_' + imdbID;
  let reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
  
  // Include currentUser in the review object
  reviews.push({ username: currentUser, text: reviewText, rating: reviewRating });
  localStorage.setItem(reviewsKey, JSON.stringify(reviews));
  
  // Clear the form fields
  document.getElementById("review-text").value = "";
  document.getElementById("review-rating").value = "";
  
  loadReviews();
}


function deleteReview(index) {
  const reviewsKey = 'reviews_' + imdbID;
  let reviews = JSON.parse(localStorage.getItem(reviewsKey) || '[]');
  reviews.splice(index, 1);
  localStorage.setItem(reviewsKey, JSON.stringify(reviews));
  
  loadReviews();
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
      let errorMessage = `HTTP error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        console.warn("Response is not JSON, falling back to status text.");
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    Swal.fire("Error", error.message, "error");
    throw error;
  }
}

