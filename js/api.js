/**
 * CineVerse Core API Connection Layer Orchestrator
 * Fully integrated with Jikan Open Engine and GNews Framework.
 * Uses your active GNews token: 15d68c874a09d8c18d95589e9b65c6d6
 */

const API_CONFIG = {
    GNEWS_KEY: '15d68c874a09d8c18d95589e9b65c6d6',
    JIKAN_BASE_URL: 'https://api.jikan.moe/v4',
    GNEWS_BASE_URL: 'https://gnews.io/api/v4'
};

const CineVerseAPI = {
    /**
     * Reusable central request execution utility with error handling
     */
    async executeRequest(endpointUrl) {
        try {
            const response = await fetch(endpointUrl);
            if (!response.ok) {
                throw new Error(`Network response error. Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`CineVerse Core Data Fetch Error [${endpointUrl}]:`, error);
            if (typeof CineVerseUI !== 'undefined') {
                CineVerseUI.showToast('Data synchronization event failed.', 'error');
            }
            return null;
        }
    },

    // --- Jikan Movie Implementations (Replacing TMDb with Jikan Anime Movies) ---
    async fetchTrendingMovies(page = 1) {
        // Fetches top upcoming/recent anime movies to simulate a premium movie feed
        const url = `${API_CONFIG.JIKAN_BASE_URL}/top/anime?type=movie&filter=bypopularity&page=${page}&limit=12`;
        const data = await this.executeRequest(url);
        return this.mapJikanToMovieStructure(data);
    },

    async fetchTopRatedMovies(page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/top/anime?type=movie&filter=favorite&page=${page}&limit=12`;
        const data = await this.executeRequest(url);
        return this.mapJikanToMovieStructure(data);
    },

    async fetchUpcomingMovies(page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/top/anime?type=movie&filter=upcoming&page=${page}&limit=12`;
        const data = await this.executeRequest(url);
        return this.mapJikanToMovieStructure(data);
    },

    async searchMovies(query, page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&type=movie&page=${page}&limit=12`;
        const data = await this.executeRequest(url);
        return this.mapJikanToMovieStructure(data);
    },

    async fetchMovieDetails(movieId) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/anime/${movieId}`;
        const res = await this.executeRequest(url);
        if (res && res.data) {
            // Transform object directly to maintain cross-compatibility with ui.js
            return {
                id: res.data.mal_id,
                title: res.data.title,
                vote_average: res.data.score,
                release_date: res.data.aired?.from ? res.data.aired.from.split('T')[0] : 'N/A',
                overview: res.data.synopsis,
                poster_path: null, 
                images: res.data.images,
                trailer: res.data.trailer
            };
        }
        return null;
    },

    // --- Jikan Engine Anime (TV Series) Implementations ---
    async fetchPopularAnime(page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/top/anime?type=tv&page=${page}&limit=12`;
        return await this.executeRequest(url);
    },

    async searchAnime(query, page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&type=tv&page=${page}&limit=12`;
        return await this.executeRequest(url);
    },

    async fetchAnimeByGenre(genreId, page = 1) {
        const url = `${API_CONFIG.JIKAN_BASE_URL}/anime?genres=${genreId}&type=tv&page=${page}&limit=12&order_by=score&sort=desc`;
        return await this.executeRequest(url);
    },

    // --- GNews Framework Implementations (Live API Key Configured) ---
    async fetchEntertainmentNews(topic = 'entertainment') {
        const url = `${API_CONFIG.GNEWS_BASE_URL}/top-headlines?category=entertainment&q=${encodeURIComponent(topic)}&lang=en&apikey=${API_CONFIG.GNEWS_KEY}`;
        return await this.executeRequest(url);
    },

    /**
     * Helper Mapper: Formats Jikan data payloads to replicate TMDb structural names
     * to prevent breaking changes in existing dynamic rendering nodes inside ui.js.
     */
    mapJikanToMovieStructure(jikanData) {
        if (!jikanData || !jikanData.data) return { results: [] };
        return {
            results: jikanData.data.map(item => ({
                id: item.mal_id,
                title: item.title,
                vote_average: item.score || 0,
                release_date: item.aired?.string || 'Unknown',
                overview: item.synopsis || 'No overview summary available.',
                images: item.images, // Pass along original image objects for ui.js parsing
                trailer: item.trailer
            }))
        };
    }
};
