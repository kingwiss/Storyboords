const { dbHelpers } = require('./database.js');
const bcrypt = require('bcrypt');

async function createTestData() {
    try {
        console.log('Creating test user and article...');
        
        // Create test user
        const testEmail = 'test@example.com';
        const testPassword = 'testpassword123';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        
        // Insert test user
        const userResult = await dbHelpers.createUser('testuser', testEmail, hashedPassword);
        console.log('Test user created with ID:', userResult.id);
        
        // Create test article
        const testArticle = {
            userId: userResult.id,
            title: 'Test Article for Loading Functionality',
            full_text: 'This is a comprehensive test article content. It contains multiple paragraphs to test the word highlighting and audio functionality. This is the first paragraph with detailed information about the test case.\n\nThis is the second paragraph that continues the test content. The article should display properly when accessed from the My Articles page. The content includes various sentences to test the text-to-speech functionality and word highlighting features.',
            summary: 'This is a test summary that describes the main points of the test article for debugging purposes.',
            key_points: JSON.stringify(['Test point one about functionality', 'Test point two about user interface', 'Test point three about audio features']),
            image_urls: JSON.stringify(['https://via.placeholder.com/300x200?text=Test+Image+1', 'https://via.placeholder.com/300x200?text=Test+Image+2']),
            url: 'https://example.com/test-article',
            created_at: new Date().toISOString()
        };
        
        // Insert test article
        const articleResult = await dbHelpers.saveUserAudiobook(
            testArticle.userId,
            testArticle.title,
            testArticle.url,
            testArticle.full_text,
            testArticle.summary,
            JSON.parse(testArticle.key_points),
            JSON.parse(testArticle.image_urls)
        );
        
        console.log('Test article created with ID:', articleResult.id);
        console.log('\nTest data created successfully!');
        console.log('Test user credentials:');
        console.log('Email:', testEmail);
        console.log('Password:', testPassword);
        console.log('\nYou can now:');
        console.log('1. Go to http://localhost:3000/my-articles.html');
        console.log('2. Login with the test credentials');
        console.log('3. Click "Read & Listen" on the test article');
        
    } catch (error) {
        console.error('Error creating test data:', error);
    }
}

createTestData();