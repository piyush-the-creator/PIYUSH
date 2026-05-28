/**
 * CineVerse Movies Database Operations Layer
 * Handles layout rendering, search execution, page changes, and query criteria filters.
 */

document.addEventListener('DOMContentLoaded', () => {
    CineVerseUI.initCommonUI();
    MovieSectionApp.init();
});

const MovieSectionApp = {
    currentPage: 1,
    currentFilter: 'trending',
    searchMode: false,
    searchQuery: '',

    init() {
        this.loadMovies();
        this.setupEventListeners();
    },

    async loadMovies() {
        const grid = document.getElementById('movieDisplayGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;

        let data;
        if (this.searchMode) {
            data = await CineVerseAPI.searchMovies(this.searchQuery, this.currentPage);
        } else {
            if (this.currentFilter === 'top_rated') {
                data = await CineVerseAPI.fetchTopRatedMovies(this.currentPage);
            } else if (this.currentFilter === 'upcoming') {
                data = await CineVerseAPI.fetchUpcomingMovies(this.currentPage);
            } else {
                data = await CineVerseAPI.fetchTrendingMovies(this.currentPage);
            }
        }

        grid.innerHTML = '';

        if (data && data.results && data.results.length > 0) {
            data.results.forEach(movie => {
                const card = CineVerseUI.createItemCard(movie, 'movie');
                grid.appendChild(card);
            });
            this.updatePaginationUI();
        } else {
            grid.innerHTML = '<p class="error-msg" style="grid-column: 1/-1;">No movies found matching current criteria records.</p>';
        }
    },

    setupEventListeners() {
        const searchBtn = document.getElementById('movieSearchBtn');
        const searchInput = document.getElementById('movieSearchInput');
        const filterTabs = document.querySelectorAll('.filter-tab');

        if (searchBtn && searchInput) {
            const executeSearch = () => {
                const text = searchInput.value.trim();
                if (text) {
                    this.searchMode = true;
                    this.searchQuery = text;
                    this.currentPage = 1;
                    filterTabs.forEach(t => t.classList.remove('active'));
                    this.loadMovies();
                }
            };
            searchBtn.addEventListener('click', executeSearch);
            searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') executeSearch(); });
        }

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (searchInput) searchInput.value = '';
                
                this.searchMode = false;
                this.currentFilter = tab.getAttribute('data-type');
                this.currentPage = 1;
                this.loadMovies();
            });
        });

        // Pagination Buttons Wireup
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadMovies();
                window.scrollTo({ top: 300, behavior: 'smooth' });
            }
        });

        document.getElementById('nextPageBtn').addEventListener('click', () => {
            this.currentPage++;
            this.loadMovies();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        });
    },

    updatePaginationUI() {
        const label = document.getElementById('currentPageLabel');
        const prevBtn = document.getElementById('prevPageBtn');
        if (label) label.textContent = `Page ${this.currentPage}`;
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    }
};
