const API_KEY = '8ff0a9d8';
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const languageSelect = document.getElementById('language-select');
    const movieList = document.getElementById('movie-list');
    const favoritesContainer = document.getElementById('favorites');

    let dark = true;
    let currentLanguage = '';

    toggleThemeBtn.onclick = () => {
      dark = !dark;
      document.documentElement.style.setProperty('--bg', dark ? '#0d0d0d' : '#f0f0f0');
      document.documentElement.style.setProperty('--fg', dark ? '#ffffff' : '#000000');
      document.documentElement.style.setProperty('--card-bg', dark ? '#1e1e1e' : '#ffffff');
    };

    searchBtn.onclick = () => {
      const query = searchInput.value.trim();
      if (query) searchMovies(query);
    };

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') searchBtn.click();
    });

    languageSelect.onchange = () => {
      currentLanguage = languageSelect.value;
      if (searchInput.value) searchMovies(searchInput.value);
    };

    async function searchMovies(query) {
      movieList.innerHTML = '<p>Loading...</p>';
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=1`);
      const data = await response.json();
      if (data.Response === "False") {
        movieList.innerHTML = `<p>${data.Error}</p>`;
        return;
      }

      const movies = data.Search || [];
      let filtered = [];

      for (const movie of movies) {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`);
        const full = await res.json();
        if (!currentLanguage || (full.Language && full.Language.includes(currentLanguage))) {
          filtered.push(full);
        }
      }

      displayMovies(filtered);
    }

    function displayMovies(movies) {
      movieList.innerHTML = '';
      movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/220x320'}" />
          <div class="movie-info">
            <h3>${movie.Title} (${movie.Year})</h3>
            <p><strong>Genre:</strong> ${movie.Genre || 'N/A'}</p>
            <p><strong>IMDB:</strong> ⭐ ${movie.imdbRating || 'N/A'}</p>
            <button onclick="addFavorite('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">❤ Add</button>
          </div>`;
        movieList.appendChild(card);
      });
    }

    function addFavorite(id, title, poster) {
      let favs = JSON.parse(localStorage.getItem('favorites')) || [];
      if (!favs.find(f => f.id === id)) {
        favs.push({ id, title, poster });
        localStorage.setItem('favorites', JSON.stringify(favs));
        loadFavorites();
      } else {
        alert('Already added!');
      }
    }

    function loadFavorites() {
      favoritesContainer.innerHTML = '';
      const favs = JSON.parse(localStorage.getItem('favorites')) || [];
      favs.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
          <img src="${fav.poster !== 'N/A' ? fav.poster : 'https://via.placeholder.com/40'}" />
          <span>${fav.title}</span>`;
        favoritesContainer.appendChild(item);
      });
    }

    window.onload = () => {
      loadFavorites();
      searchInput.value = 'Avengers';
      searchBtn.click();
    };
