const express = require('express');
const cors = require('cors'); // Import cors
const { scrapeAliExpress } = require('./scraper');
const { scrapeAI } = require("./scrapper-ai");

const app = express();
const PORT = 3000;

// Enable CORS for all origins or specific ones
app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend access
    methods: ['GET', 'POST'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'] // Allowed headers
}));

app.get('/scrape', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await scrapeAliExpress(searchQuery, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

app.get('/scrape-ai', async (req, res) => {
    try {
        const url = req.query.url || '';
        const summarizeText = req.query.summarize || '';
        const searchQuery = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await scrapeAI(url, searchQuery, page, limit, summarizeText);
        res.json(result);
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).json({ error: 'Failed to scrape data' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
