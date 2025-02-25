const express = require('express');
const { scrapeAliExpress } = require('./scraper');
const {scrapeAI} = require("./scrapper-ai");

const app = express();
const PORT = 3000;

app.get('/scrape', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        // Parse page and limit from query parameters (default: page 1, limit 20)
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
