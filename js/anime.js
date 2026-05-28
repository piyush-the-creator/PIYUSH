/**
 * CineVerse Otaku Data Hub Subsystem Controller
 * Coordinates category management filters, Jikan API streaming indexes, and detail requests.
 */

document.addEventListener('DOMContentLoaded', () => {
    CineVerseUI.initCommonUI();
    AnimeSectionApp.init();
});

const AnimeSectionApp = {
    currentPage: 1,
    searchMode: false,
    searchQuery: '',
    currentGenre: '',

    init() {
        this.loadAnime();
        this.setupEventListeners();
    },

    async loadAnime() {
        const grid = document.getElementById('animeDisplayGrid');
        if (!grid) return;

        grid.innerHTML = '<div class="skeleton-card"></div>'.repeat(4);

        let data;
        if (this.searchMode) {
            data = await CineVerseAPI.searchAnime(this.searchQuery, this.currentPage);
        } else if (this.currentGenre) {
            data = await CineVerseAPI.fetchAnimeByGenre(this.currentGenre, this.currentPage);
        } else {
            data = await CineVerseAPI.fetchPopularAnime(this.currentPage);
        }

        grid.innerHTML = '';

        if (data && data.data && data.data.length > 0) {
            data.data.forEach(anime => {
                const card = CineVerseUI.createItemCard(anime, 'anime');
                grid.appendChild(card);
            });
            this.updatePaginationUI();
        } else {
            grid.innerHTML = '<p class="error-msg" style="grid-column:1/-1;">No anime items found matching current parameters.</p>';
        }
    },

    setupEventListeners() {
        const searchBtn = document.getElementById('animeSearchBtn');
        const searchInput = document.getElementById('animeSearchInput');
        const genreDropdown = document.getElementById('genreDropdown');

        if (searchBtn && searchInput) {
            const runSearch = () => {
                const val = searchInput.value.trim();
                if (val) {
                    this.searchMode = true;
                    this.searchQuery = val;
                    this.currentGenre = '';
                    if (genreDropdown) genreDropdown.value = '';
                    this.currentPage = 1;
                    this.loadAnime();
                }
            };
            searchBtn.addEventListener('click', runSearch);
            searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') runSearch(); });
        }

        if (genreDropdown) {
            genreDropdown.addEventListener('change', () => {
                if (searchInput) searchInput.value = '';
                this.searchMode = false;
                this.currentGenre = genreDropdown.value;
                this.currentPage = 1;
                this.loadAnime();
            });
        }

        document.getElementById('animePrevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadAnime();
            }
        });
        document.getElementById('animeNextBtn').addEventListener('click', () => {
            this.currentPage++;
            this.loadAnime();
        });
    },

    updatePaginationUI() {
        const lbl = document.getElementById('animePageLabel');
        const prev = document.getElementById('animePrevBtn');
        if (lbl) lbl.textContent = `Catalog Index ${this.currentPage}`;
        if (prev) prev.disabled = this.currentPage === 1;
    }
};
