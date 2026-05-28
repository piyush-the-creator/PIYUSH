/**
 * CineVerse Shared Rendering UI Library
 * Builds UI widgets, manages theme changes, updates watchlists, and handles modals.
 */

const CineVerseUI = {
    /**
     * Initializes Global Shared System Elements (Theme, Back-to-Top, Navigation)
     */
    initCommonUI() {
        this.setupThemeEngine();
        this.setupHamburgerMenu();
        this.setupScrollToTop();
        this.setupGlobalModalClose();
    },

    setupThemeEngine() {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return;

        const savedTheme = localStorage.getItem('cineverse-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(toggleBtn, savedTheme);

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('cineverse-theme', targetTheme);
            this.updateThemeIcon(toggleBtn, targetTheme);
            this.showToast(`Switched to ${targetTheme} presentation profile.`, 'info');
        });
    },

    updateThemeIcon(btn, theme) {
        btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    },

    setupHamburgerMenu() {
        const menuTrigger = document.getElementById('hamburgerMenu');
        const linksContainer = document.getElementById('navLinks');
        if (!menuTrigger || !linksContainer) return;

        menuTrigger.addEventListener('click', () => {
            menuTrigger.classList.toggle('active-toggle');
            linksContainer.classList.toggle('active-menu');
        });
    },

    setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    setupGlobalModalClose() {
        const modal = document.getElementById('globalModal');
        const closeBtn = document.getElementById('modalCloseBtn');
        if (!modal) return;

        const dismissModal = () => {
            modal.classList.add('hidden');
            document.getElementById('modalBody').innerHTML = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', dismissModal);
        
        // Close modal when clicking outside the content box
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                dismissModal();
            }
        });
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    /**
     * Standard Generic Card Factory Component
     */
    createItemCard(item, systemContext) {
        const isMovie = systemContext === 'movie';
        const itemId = item.id;
        const title = isMovie ? item.title : item.title;
        const rating = isMovie ? (item.vote_average ? item.vote_average.toFixed(1) : 'N/A') : (item.score ? item.score : 'N/A');
        const date = isMovie ? (item.release_date ? item.release_date.split('-')[0] : 'Unknown') : (item.type || 'TV');
        const desc = isMovie ? item.overview : item.synopsis;
        
        let posterUrl = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&auto=format&fit=crop';
        if (isMovie && item.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        } else if (!isMovie && item.images?.jpg?.image_url) {
            posterUrl = item.images.jpg.image_url;
        }

        const isFav = this.checkFavoriteStatus(itemId, systemContext);

        const card = document.createElement('div');
        card.className = 'card-item';
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${posterUrl}" alt="${title}" loading="lazy">
                <div class="card-overlay-badge"><i class="fas fa-star"></i> ${rating}</div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${title}</h3>
                <div class="card-meta">${date}</div>
                <p class="card-desc">${desc || 'No descriptive context available at present.'}</p>
                <div class="card-actions-row">
                    <button class="btn btn-primary btn-sm details-trigger-btn" style="padding: 0.4rem 0.8rem; font-size:0.85rem;">Details</button>
                    <button class="btn-favorite ${isFav ? 'active' : ''}" data-id="${itemId}" data-context="${systemContext}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;

        // Wire active tracking events
        card.querySelector('.details-trigger-btn').addEventListener('click', () => {
            this.openDetailedModal(item, systemContext);
        });

        const favBtn = card.querySelector('.btn-favorite');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWatchlistState(item, systemContext, favBtn);
        });

        return card;
    },

    checkFavoriteStatus(id, context) {
        const storeKey = context === 'movie' ? 'cineverse-fav-movies' : 'cineverse-fav-anime';
        const currentList = JSON.parse(localStorage.getItem(storeKey)) || [];
        return currentList.some(item => item.id == id);
    },

    toggleWatchlistState(item, context, element) {
        const storeKey = context === 'movie' ? 'cineverse-fav-movies' : 'cineverse-fav-anime';
        let currentList = JSON.parse(localStorage.getItem(storeKey)) || [];
        const index = currentList.findIndex(i => i.id == item.id);

        if (index > -1) {
            currentList.splice(index, 1);
            element.classList.remove('active');
            this.showToast('Removed from Watchlist collection.', 'info');
        } else {
            currentList.push(item);
            element.classList.add('active');
            this.showToast('Successfully committed to Watchlist.');
        }
        localStorage.setItem(storeKey, JSON.stringify(currentList));
    },

    /**
     * Launches Popovers Containing Trailers or System Meta Logs
     */
    async openDetailedModal(item, context) {
        const modal = document.getElementById('globalModal');
        const body = document.getElementById('modalBody');
        if (!modal || !body) return;

        body.innerHTML = '<div class="skeleton-card" style="height:250px;"></div>';
        modal.classList.remove('hidden');

        const isMovie = context === 'movie';
        let title = isMovie ? item.title : item.title;
        let rating = isMovie ? (item.vote_average || 'N/A') : (item.score || 'N/A');
        let desc = isMovie ? item.overview : item.synopsis;
        let posterUrl = isMovie ? 
            (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400&auto=format&fit=crop') : 
            item.images?.jpg?.large_image_url;

        let dynamicTrailerFrame = '';

        if (isMovie && item.id > 200) { // Call api details if not using fallback
            const fullDetails = await CineVerseAPI.fetchMovieDetails(item.id);
            if (fullDetails && fullDetails.videos?.results) {
                const trailer = fullDetails.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                if (trailer) {
                    dynamicTrailerFrame = `
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                }
            }
        } else if (!isMovie && item.trailer?.youtube_id) {
            dynamicTrailerFrame = `
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${item.trailer.youtube_id}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
        }

        body.innerHTML = `
            <div class="modal-detail-grid">
                <div class="modal-poster">
                    <img src="${posterUrl}" alt="${title}">
                </div>
                <div class="modal-info-pane">
                    <h2>${title}</h2>
                    <div class="modal-meta-row">
                        <span><i class="fas fa-star" style="color:#ffcc00;"></i> ${rating}</span>
                        <span>${isMovie ? 'Release: ' + (item.release_date || 'N/A') : 'Episodes: ' + (item.episodes || 'N/A')}</span>
                    </div>
                    <p class="modal-synopsis">${desc || 'Detailed profile metrics are still being compiled for this entity record.'}</p>
                    ${dynamicTrailerFrame}
                </div>
            </div>
        `;
    }
};
