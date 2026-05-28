/**
 * CineVerse Landing Page (Index Orchestrator Layout)
 * Manages Home component bindings, data sliders, and the mood feature.
 */

document.addEventListener('DOMContentLoaded', () => {
    CineVerseUI.initCommonUI();
    HomeApp.init();
});

const HomeApp = {
    init() {
        this.loadTrendingMovies();
        this.loadPopularAnime();
        this.loadEntertainmentNews();
        this.setupMoodEngine();
        this.setupGlobalAutocomplete();
    },

    async loadTrendingMovies() {
        const container = document.getElementById('trendingMoviesHome');
        if (!container) return;

        const data = await CineVerseAPI.fetchTrendingMovies();
        container.innerHTML = ''; // Dismiss loading wrappers

        if (data && data.results) {
            // Display first 4 elements for visual impact
            data.results.slice(0, 4).forEach(movie => {
                const card = CineVerseUI.createItemCard(movie, 'movie');
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="error-msg">Failed to retrieve current movie tracking items.</p>';
        }
    },

    async loadPopularAnime() {
        const container = document.getElementById('popularAnimeHome');
        if (!container) return;

        const data = await CineVerseAPI.fetchPopularAnime();
        container.innerHTML = '';

        if (data && data.data) {
            data.data.slice(0, 4).forEach(anime => {
                const card = CineVerseUI.createItemCard(anime, 'anime');
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="error-msg">Failed to retrieve tracking metrics for modern anime.</p>';
        }
    },

    async loadEntertainmentNews() {
        const container = document.getElementById('latestNewsHome');
        if (!container) return;

        const data = await CineVerseAPI.fetchEntertainmentNews();
        container.innerHTML = '';

        if (data && data.articles) {
            data.articles.slice(0, 3).forEach(article => {
                const card = document.createElement('div');
                card.className = 'news-card';
                card.innerHTML = `
                    <img src="${article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400&auto=format&fit=crop'}" alt="Headline Photo" class="news-thumbnail">
                    <div class="news-content">
                        <h3 class="news-headline">${article.title}</h3>
                        <p class="news-summary">${article.description || 'Context description omitted. Read full coverage via standard resource channels.'}</p>
                        <div class="news-footer-row">
                            <span>${article.source.name || 'Press Distribution'}</span>
                            <a href="${article.url}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.8rem;">Read Article <i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="error-msg">Failed to establish active secure connection to newswire feeds.</p>';
        }
    },

    setupMoodEngine() {
        const targetOutput = document.getElementById('moodResults');
        const moodButtons = document.querySelectorAll('.mood-btn');
        if (!targetOutput || moodButtons.length === 0) return;

        moodButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Clear active states
                moodButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                targetOutput.innerHTML = '<div class="skeleton-card" style="grid-column: 1/-1; height: 200px;"></div>';
                targetOutput.classList.remove('hidden');

                const selectedMood = btn.getAttribute('data-mood');
                let searchTarget = 'comedy'; // Base standard fallback parameter

                if (selectedMood === 'sad') searchTarget = 'feel good';
                if (selectedMood === 'excited') searchTarget = 'action';
                if (selectedMood === 'relaxed') searchTarget = 'slice of life';

                // Fetch data matching the mood parameters
                const results = await CineVerseAPI.searchAnime(searchTarget);
                targetOutput.innerHTML = '';

                if (results && results.data && results.data.length > 0) {
                    results.data.slice(0, 4).forEach(anime => {
                        const card = CineVerseUI.createItemCard(anime, 'anime');
                        targetOutput.appendChild(card);
                    });
                    CineVerseUI.showToast(`Mood system updated content matching dynamic query: ${searchTarget.toUpperCase()}`);
                } else {
                    targetOutput.innerHTML = '<p style="grid-column:1/-1;">No data found for this mood query.</p>';
                }
            });
        });
    },

    setupGlobalAutocomplete() {
        const searchInput = document.getElementById('globalSearch');
        const dropdown = document.getElementById('searchSuggestions');
        if (!searchInput || !dropdown) return;

        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            const query = searchInput.value.trim();

            if (query.length < 3) {
                dropdown.classList.add('hidden');
                return;
            }

            debounceTimeout = setTimeout(async () => {
                // Execute high-speed search across the Jikan open anime catalog
                const data = await CineVerseAPI.searchAnime(query);
                dropdown.innerHTML = '';

                if (data && data.data && data.data.length > 0) {
                    dropdown.classList.remove('hidden');
                    data.data.slice(0, 5).forEach(anime => {
                        const row = document.createElement('div');
                        row.className = 'suggestion-item';
                        row.innerHTML = `
                            <img src="${anime.images?.jpg?.image_url}" alt="mini-poster">
                            <div>
                                <div style="font-weight:600; font-size:0.9rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:220px;">${anime.title}</div>
                                <div style="font-size:0.75rem; color:var(--text-secondary);">${anime.type || 'TV'} &bull; Score: ${anime.score || 'N/A'}</div>
                            </div>
                        `;
                        row.addEventListener('click', () => {
                            dropdown.classList.add('hidden');
                            searchInput.value = '';
                            CineVerseUI.openDetailedModal(anime, 'anime');
                        });
                        dropdown.appendChild(row);
                    });
                } else {
                    dropdown.classList.add('hidden');
                }
            }, 400);
        });

        // Close dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
};
