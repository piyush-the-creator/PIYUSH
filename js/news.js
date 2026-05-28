/**
 * CineVerse Journalism Delivery System Controller
 * Handles streaming feed displays, category switches, and outbound source parsing.
 */

document.addEventListener('DOMContentLoaded', () => {
    CineVerseUI.initCommonUI();
    NewsSectionApp.init();
});

const NewsSectionApp = {
    currentTopic: 'entertainment',

    init() {
        this.loadNewsFeed();
        this.setupTabs();
    },

    async loadNewsFeed() {
        const displayGrid = document.getElementById('newsLayoutGrid');
        if (!displayGrid) return;

        displayGrid.innerHTML = '<div class="skeleton-card" style="height:300px;"></div>'.repeat(3);

        const data = await CineVerseAPI.fetchEntertainmentNews(this.currentTopic);
        displayGrid.innerHTML = '';

        if (data && data.articles && data.articles.length > 0) {
            data.articles.forEach(article => {
                const card = document.createElement('div');
                card.className = 'news-card';
                card.innerHTML = `
                    <img src="${article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=400&auto=format&fit=crop'}" alt="Article Thumbnail" class="news-thumbnail" loading="lazy">
                    <div class="news-content">
                        <h3 class="news-headline">${article.title}</h3>
                        <p class="news-summary">${article.description || 'Full journalistic body elements omitted. Select source link to view native publication.'}</p>
                        <div class="news-footer-row">
                            <span><strong>Source:</strong> ${article.source.name || 'Press Bureau'}</span>
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm" style="padding: 0.4rem 0.8rem; font-size:0.8rem;">Read Full Press <i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                `;
                displayGrid.appendChild(card);
            });
        } else {
            displayGrid.innerHTML = '<p class="error-msg" style="grid-column: 1/-1;">Unable to synchronize news tracking records at this moment.</p>';
        }
    },

    setupTabs() {
        const tabs = document.querySelectorAll('.news-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTopic = tab.getAttribute('data-topic');
                this.loadNewsFeed();
            });
        });
    }
};
