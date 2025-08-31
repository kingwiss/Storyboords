// Debug script to test article loading functionality
// Run this in the browser console on the My Articles page

function testArticleLoading() {
    console.log('=== STARTING ARTICLE LOADING TEST ===');
    
    // Create test article data that matches the database structure
    const testArticle = {
        id: 999,
        title: 'Debug Test Article',
        content: 'This is a comprehensive test article content with multiple sentences. It contains enough text to properly test the word highlighting functionality during audio playback. This third sentence adds more content for testing purposes. The fourth sentence ensures we have substantial content to work with.',
        summary: 'This is a test summary that describes the main points of the article in a concise manner.',
        key_points: [
            'First key point about the article content',
            'Second important insight from the text', 
            'Third crucial takeaway for readers'
        ],
        image_urls: [
            'https://via.placeholder.com/400x300/0066cc/ffffff?text=Test+Image+1',
            'https://via.placeholder.com/400x300/cc6600/ffffff?text=Test+Image+2'
        ],
        url: 'https://example.com/debug-test-article',
        created_at: new Date().toISOString()
    };
    
    console.log('=== TEST ARTICLE DATA ===', testArticle);
    
    // Test the viewArticle function if it exists
    if (typeof viewArticle === 'function') {
        console.log('=== CALLING viewArticle FUNCTION ===');
        viewArticle(testArticle.id, [testArticle]);
    } else {
        console.error('=== viewArticle FUNCTION NOT FOUND ===');
        
        // Manually test the sessionStorage flow
        console.log('=== MANUALLY TESTING SESSIONSTORAGE FLOW ===');
        
        const articleData = {
            id: testArticle.id,
            title: testArticle.title,
            full_text: testArticle.content,
            summary: testArticle.summary,
            key_points: testArticle.key_points,
            image_urls: testArticle.image_urls,
            url: testArticle.url
        };
        
        console.log('=== STORING IN SESSIONSTORAGE ===', articleData);
        sessionStorage.setItem('viewArticleData', JSON.stringify(articleData));
        
        console.log('=== SESSIONSTORAGE CONTENT ===', sessionStorage.getItem('viewArticleData'));
        
        // Redirect to main page
        console.log('=== REDIRECTING TO INDEX.HTML ===');
        window.location.href = 'index.html';
    }
}

// Auto-run the test
testArticleLoading();