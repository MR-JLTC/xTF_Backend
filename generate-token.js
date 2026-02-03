const fs = require('fs');
const http = require('http');
const url = require('url');
const { exec } = require('child_process');

// Configuration
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Read from .env if possible, or ask user to input
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    console.error('❌ Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables or edit this script.');
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    const q = url.parse(req.url, true).query;

    if (req.url.startsWith('/oauth2callback')) {
        if (q.code) {
            console.log(`\n✅ Authorization Code received: ${q.code}`);
            res.end('Authentication successful! Please return to the console.');
            server.close();

            // Exchange code for tokens
            try {
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: q.code,
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        redirect_uri: REDIRECT_URI,
                        grant_type: 'authorization_code',
                    }),
                });

                const tokens = await tokenResponse.json();

                console.log('\n==================================================');
                console.log('🎉 NEW REFRESH TOKEN GENERATED!');
                console.log('==================================================\n');
                console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
                console.log('\n==================================================');
                console.log('👉 ACTION REQUIRED:');
                console.log('1. Copy the token above.');
                console.log('2. Go to your Render Dashboard -> Environment Variables.');
                console.log('3. Update GMAIL_REFRESH_TOKEN with this new value.');
                console.log('4. Redeploy/Restart your service.');

                process.exit(0);
            } catch (err) {
                console.error('❌ Error exchanging code for token:', err);
                process.exit(1);
            }
        }
    }
});

server.listen(3000, () => {
    // Generate Auth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `access_type=offline&` +
        `scope=${encodeURIComponent(SCOPES.join(' '))}&` +
        `response_type=code&` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `prompt=consent`; // prompt=consent forces a new refresh token

    console.log('Opening browser for authentication...');
    console.log(`If it does not open, verify this URL: ${authUrl}`);

    // Try to open browser
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} "${authUrl}"`);
});
