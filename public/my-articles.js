document.addEventListener('DOMContentLoaded', () => {
    // Authentication elements - using same IDs as main app
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileBtn = document.getElementById('profile-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginClose = document.getElementById('login-close');
    const signupClose = document.getElementById('signup-close');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const usernameSpan = document.getElementById('username');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    // My Articles specific elements
    const articlesContainer = document.getElementById('articles-container');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    
    // Authentication state - using same variables as main app
    let currentUser = null;
    let authToken = localStorage.getItem('authToken');
    
    // Articles data
    let userArticles = [];
    
    // Floating button functionality
    const CURRENT_ARTICLE_KEY = 'currentArticleState';
    
    function checkAndShowFloatingButton() {
        try {
            const savedState = localStorage.getItem(CURRENT_ARTICLE_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                const now = Date.now();
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (now - state.timestamp <= maxAge && state.fullText) {
                    const isTTSActive = speechSynthesis.speaking || speechSynthesis.pending;
                    const activeArticleBtn = document.getElementById('active-article-btn');
                    
                    if (activeArticleBtn) {
                        activeArticleBtn.style.display = 'flex';
                        const statusSpan = activeArticleBtn.querySelector('.article-status');
                        if (statusSpan) {
                            statusSpan.textContent = isTTSActive ? 'Article Playing' : 'Return to Article';
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking floating button state:', error);
        }
    }
    
    // Floating active article button functionality
    const activeArticleBtn = document.getElementById('active-article-btn');
    if (activeArticleBtn) {
        activeArticleBtn.addEventListener('click', () => {
            window.location.href = 'article-view.html';
        });
    }
    
    // Authentication functions - copied from main app
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    function hideError(element) {
        element.style.display = 'none';
    }
    
    function updateAuthUI() {
        if (currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameSpan) usernameSpan.textContent = currentUser.username;
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
    
    async function checkAuthStatus() {
        console.log('=== DEBUG: Checking auth status, authToken:', authToken ? 'exists' : 'null');
        if (authToken) {
            try {
                console.log('=== DEBUG: Making request to /api/auth/me');
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    credentials: 'include'
                });
                
                console.log('=== DEBUG: Auth response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('=== DEBUG: Auth successful, user:', data.user);
                    currentUser = data.user;
                    updateAuthUI();
                    loadUserArticles();
                } else {
                    console.log('=== DEBUG: Auth failed, removing token');
                    // Token is invalid, remove it
                    localStorage.removeItem('authToken');
                    authToken = null;
                    currentUser = null;
                    updateAuthUI();
                    showEmptyState();
                }
            } catch (error) {
                console.error('=== DEBUG: Auth check failed:', error);
                localStorage.removeItem('authToken');
                authToken = null;
                currentUser = null;
                updateAuthUI();
                showEmptyState();
            }
        } else {
            console.log('=== DEBUG: No auth token found, showing empty state');
            updateAuthUI();
            showEmptyState();
        }
    }
    
    // Modal functions - copied from main app
    function openModal(modal) {
        modal.style.display = 'block';
    }
    
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Authentication event listeners - copied from main app
    if (loginBtn && loginModal && loginError) {
        loginBtn.addEventListener('click', () => {
            hideError(loginError);
            openModal(loginModal);
        });
    }
    
    if (signupBtn && signupModal && signupError) {
        signupBtn.addEventListener('click', () => {
            hideError(signupError);
            openModal(signupModal);
        });
    }
    
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            // Redirect to main page profile
            window.location.href = 'index.html#profile';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            authToken = null;
            currentUser = null;
            userArticles = [];
            updateAuthUI();
            showEmptyState();
        });
    }
    
    // Modal close events - copied from main app
    if (loginClose && loginModal) {
        loginClose.addEventListener('click', () => closeModal(loginModal));
    }
    if (signupClose && signupModal) {
        signupClose.addEventListener('click', () => closeModal(signupModal));
    }
    
    // Switch between login and signup - copied from main app
    if (switchToSignup && loginModal && signupModal && signupError) {
        switchToSignup.addEventListener('click', () => {
            closeModal(loginModal);
            hideError(signupError);
            openModal(signupModal);
        });
    }
    
    if (switchToLogin && signupModal && loginModal && loginError) {
        switchToLogin.addEventListener('click', () => {
            closeModal(signupModal);
            hideError(loginError);
            openModal(loginModal);
        });
    }
    
    // Close modals when clicking outside - copied from main app
    if (loginModal || signupModal) {
        window.addEventListener('click', (event) => {
            if (loginModal && event.target === loginModal) closeModal(loginModal);
            if (signupModal && event.target === signupModal) closeModal(signupModal);
        });
    }
    
    // Form submissions - copied from main app
    if (loginForm && loginError) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError(loginError);
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('authToken', authToken);
                    updateAuthUI();
                    closeModal(loginModal);
                    loginForm.reset();
                    loadUserArticles();
                } else {
                    showError(loginError, data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                showError(loginError, `Network error: ${error.message}. Please check console for details.`);
            }
        });
    }
    
    if (signupForm && signupError) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError(signupError);
            
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            if (password !== confirmPassword) {
                showError(signupError, 'Passwords do not match');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('authToken', authToken);
                    updateAuthUI();
                    closeModal(signupModal);
                    signupForm.reset();
                    loadUserArticles();
                } else {
                    showError(signupError, data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Signup error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                showError(signupError, `Network error: ${error.message}. Please check console for details.`);
            }
        });
    }
    
    // My Articles specific functions
    async function loadUserArticles() {
        console.log('=== DEBUG: loadUserArticles called, authToken:', authToken ? 'exists' : 'null');
        if (!authToken) {
            console.log('=== DEBUG: No auth token, showing empty state');
            showEmptyState();
            return;
        }
        
        console.log('=== DEBUG: Showing loading state');
        showLoadingState();
        
        try {
            console.log('=== DEBUG: Making request to /api/user/audiobooks');
            const response = await fetch('/api/user/audiobooks', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('=== DEBUG: Articles response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('=== DEBUG: Articles data received:', data);
                userArticles = data.audiobooks || [];
                console.log('=== DEBUG: User articles array:', userArticles.length, 'items');
                renderArticles();
            } else {
                console.error('=== DEBUG: Failed to load articles:', response.status);
                const errorText = await response.text();
                console.error('=== DEBUG: Error response:', errorText);
                showEmptyState();
            }
        } catch (error) {
            console.error('=== DEBUG: Error loading articles:', error);
            showEmptyState();
        }
    }
    
    function renderArticles() {
        hideLoadingState();
        
        if (!userArticles || userArticles.length === 0) {
            showEmptyState();
            return;
        }
        
        hideEmptyState();
        
        articlesContainer.innerHTML = userArticles.map(article => {
            const createdDate = new Date(article.created_at).toLocaleDateString();
            const keyPoints = article.key_points || [];
            
            return `
                <div class="article-card" data-id="${article.id}">
                    <div class="article-header">
                        <h3 class="article-title">${escapeHtml(article.title)}</h3>
                        <div class="article-date">${createdDate}</div>
                    </div>
                    <div class="article-content">
                        <p class="article-summary">${escapeHtml(article.summary || 'No summary available')}</p>
                        ${keyPoints.length > 0 ? `
                            <div class="key-points">
                                <h4>Key Points:</h4>
                                <ul>
                                    ${keyPoints.slice(0, 3).map(point => `<li>${escapeHtml(point)}</li>`).join('')}
                                    ${keyPoints.length > 3 ? `<li class="more-points">+${keyPoints.length - 3} more points</li>` : ''}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    <div class="article-actions">
                        <button class="btn btn-primary" onclick="viewArticle('${article.id}')">
                            📖 View Article
                        </button>
                        <button class="btn btn-secondary" onclick="window.open('${article.url}', '_blank')">
                            🔗 Original
                        </button>
                        <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Check if we need to auto-click the latest article after rendering
        checkAndAutoClickLatest();
    }
    
    function showLoadingState() {
        if (loadingState) loadingState.style.display = 'block';
        if (articlesContainer) articlesContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }
    
    function hideLoadingState() {
        if (loadingState) loadingState.style.display = 'none';
        if (articlesContainer) articlesContainer.style.display = 'grid';
    }
    
    function showEmptyState() {
        if (emptyState) emptyState.style.display = 'block';
        if (articlesContainer) articlesContainer.style.display = 'none';
        if (loadingState) loadingState.style.display = 'none';
    }
    
    function hideEmptyState() {
        if (emptyState) emptyState.style.display = 'none';
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Auto-click functionality for latest article
    function checkAutoplayAndClickLatest() {
        const urlParams = new URLSearchParams(window.location.search);
        const autoplay = urlParams.get('autoplay');
        
        if (autoplay === 'true') {
            console.log('=== DEBUG: Autoplay detected, will auto-click latest article when loaded ===');
            // Set a flag to indicate we should auto-click when articles are loaded
            window.shouldAutoClickLatest = true;
        }
    }
    
    function checkAndAutoClickLatest() {
        if (window.shouldAutoClickLatest && userArticles && userArticles.length > 0) {
            console.log('=== DEBUG: Auto-clicking latest article ===');
            
            // Find the latest article (highest ID or most recent created_at)
            const latestArticle = userArticles.reduce((latest, current) => {
                const latestDate = new Date(latest.created_at);
                const currentDate = new Date(current.created_at);
                return currentDate > latestDate ? current : latest;
            });
            
            console.log('=== DEBUG: Latest article found:', latestArticle);
            
            // Clear the flag to prevent multiple auto-clicks
            window.shouldAutoClickLatest = false;
            
            // Remove autoplay parameter from URL to prevent re-triggering on refresh
            const url = new URL(window.location);
            url.searchParams.delete('autoplay');
            window.history.replaceState({}, document.title, url.pathname + url.search);
            
            // Auto-click the latest article with a small delay to ensure DOM is ready
            setTimeout(() => {
                console.log('=== DEBUG: Executing auto-click for article ID:', latestArticle.id);
                viewArticle(latestArticle.id.toString(), true); // Pass true for autoplay
            }, 500);
        }
    }
    
    // Global functions for article actions
    window.viewArticle = function(articleId, autoplay = false) {
        console.log('=== DEBUG: viewArticle called with ID:', articleId, 'autoplay:', autoplay);
        console.log('=== DEBUG: userArticles array:', userArticles);
        
        // Find the article data
        const article = userArticles.find(a => a.id === parseInt(articleId));
        
        if (article) {
            console.log('=== DEBUG: Found article for viewing:', article);
            console.log('=== DEBUG: Article full_text length:', article.full_text ? article.full_text.length : 'NO FULL_TEXT');
            
            const articleData = {
                id: article.id,
                title: article.title,
                content: article.full_text || '', // Map full_text to content
                full_text: article.full_text || '',
                summary: article.summary || '',
                keyPoints: article.key_points || [],
                key_points: article.key_points || [],
                imageUrls: article.image_urls || [],
                image_urls: article.image_urls || [],
                url: article.url || '',
                created_at: article.created_at,
                createdAt: article.created_at,
                timestamp: Date.now()
            };
            
            console.log('=== DEBUG: Prepared articleData for sessionStorage:', articleData);
            
            // Store complete article data for the article view page
            sessionStorage.setItem('viewArticleData', JSON.stringify(articleData));
            
            // Navigate to article view page with ID parameter and autoplay if needed
            const autoplayParam = autoplay ? '&autoplay=true' : '';
            window.location.href = `article-view.html?id=${articleId}${autoplayParam}`;
        } else {
            console.error('=== DEBUG: Article not found for ID:', articleId);
            console.error('=== DEBUG: Available article IDs:', userArticles.map(a => a.id));
            alert('Article not found');
        }
    };
    
    window.deleteArticle = async function(articleId) {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/user/audiobooks/${articleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Remove from local array and re-render
                userArticles = userArticles.filter(article => article.id !== parseInt(articleId));
                renderArticles();
            } else {
                alert('Failed to delete article');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Error deleting article');
        }
    };
    
    // Initialize music UI state (persistent music manager handles the rest)
    setTimeout(() => {
        console.log('=== DEBUG: Initializing music UI on my-articles page ===');
        
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle && window.musicPlayer) {
            // Update button state based on current music status
            if (window.musicPlayer.isCurrentlyPlaying) {
                musicToggle.classList.add('active');
                console.log('=== DEBUG: Music already playing, button activated ===');
            } else {
                musicToggle.classList.remove('active');
                console.log('=== DEBUG: Music not playing, button deactivated ===');
            }
        }
    }, 500);
    
    // Music toggle functionality
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', async () => {
            if (window.musicPlayer) {
                try {
                    if (window.musicPlayer.isCurrentlyPlaying) {
                        window.musicPlayer.stop();
                        musicToggle.classList.remove('active');
                        console.log('=== DEBUG: Music stopped via toggle button ===');
                    } else {
                        await window.musicPlayer.start();
                        musicToggle.classList.add('active');
                        console.log('=== DEBUG: Music started via toggle button ===');
                    }
                } catch (error) {
                    console.error('=== DEBUG: Failed to toggle music:', error);
                }
            }
        });
    }

    // Initialize the app when DOM is loaded
    checkAuthStatus();
    
    // Check and show floating button if there's an active article
    checkAndShowFloatingButton();
    
    // Check for autoplay parameter and auto-click latest article
    checkAutoplayAndClickLatest();
    
    // DEBUG: Add a test login button for demonstration
    const debugContainer = document.createElement('div');
    debugContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: #ff6b6b; color: white; padding: 10px; border-radius: 5px; font-size: 12px;';
    debugContainer.innerHTML = `
        <div>DEBUG: Test Login</div>
        <button id="debug-login-user4" style="margin: 5px; padding: 5px; background: white; color: black; border: none; border-radius: 3px; cursor: pointer;">Login as User 4</button>
        <button id="debug-logout" style="margin: 5px; padding: 5px; background: white; color: black; border: none; border-radius: 3px; cursor: pointer;">Logout</button>
    `;
    document.body.appendChild(debugContainer);
    
    // Debug login functionality
    document.getElementById('debug-login-user4').addEventListener('click', () => {
        // Simulate a successful login by setting a mock token
        // In a real app, this would come from a proper login process
        const mockToken = 'mock-jwt-token-for-user-4';
        localStorage.setItem('authToken', mockToken);
        authToken = mockToken;
        
        // Mock the current user
        currentUser = { id: 4, username: 'testuser4', email: 'test4@example.com' };
        
        console.log('=== DEBUG: Mock login successful for user 4 ===');
        updateAuthUI();
        loadUserArticles();
    });
    
    document.getElementById('debug-logout').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
        console.log('=== DEBUG: Logged out ===');
        updateAuthUI();
        showEmptyState();
    });
});