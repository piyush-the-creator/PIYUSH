/**
 * CineVerse Watchlist Engine Core Controller
 * Synchronizes LocalStorage array targets and maps active updates across UI panels.
 */

document.addEventListener('DOMContentLoaded', () => {
    CineVerseUI.initCommonUI();
    WatchlistApp.init();
});

const WatchlistApp = {
    init() {
        this.renderWatchlists();
    },

    renderWatchlists() {
        const movieGrid = document.getElementById('favoriteMoviesGrid');
        const animeGrid = document.getElementById('favoriteAnimeGrid');

        const savedMovies = JSON.parse(localStorage.getItem('cineverse-fav-movies')) || [];
        const savedAnime = JSON.parse(localStorage.getItem('cineverse-fav-anime')) || [];

        this.populateContainer(movieGrid, savedMovies, 'movie');
        this.populateContainer(animeGrid, savedAnime, 'anime');
    },

    populateContainer(containerElement, itemsArray, typeContext) {
        if (!containerElement) return;
        containerElement.innerHTML = '';

        if (itemsArray.length === 0) {
            containerElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem 0;">
                    <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.4;"></i>
                    <p>No tracking items saved inside this ${typeContext} library category profile yet.</p>
                </div>
            `;
            return;
        }

        itemsArray.forEach(item => {
            const card = CineVerseUI.createItemCard(item, typeContext);
            
            // Override bookmark action so item drops out instantly when clicked on watchlist layout view screen
            const favBtn = card.querySelector('.btn-favorite');
            favBtn.addEventListener('click', () => {
                // Rerender layout view screen frame state tracking changes instantly
                setTimeout(() => this.renderWatchlists(), 100);
            });

            containerElement.appendChild(card);
        });
    }
};
