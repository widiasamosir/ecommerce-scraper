const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client for OpenRouter
const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Uses DeepSeek (via OpenRouter) to extract structured data from a block of text.
 *
 * @param {string} text - The text extracted from a product card.
 * @returns {Promise<Object>} - The structured product details.
 */
const extractWithLLM = async (summarizeText, text) => {
    const prompt = summarizeText? `
    ${summarizeText}
    """${text}"""
    `: `
    Analyze this product data:
    """${text}"""
    `;

    try {
        const response = await client.chat.completions.create({
            extra_headers: {
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "EcommerceScraper",
            },
            model: "deepseek/deepseek-r1-distill-llama-70b:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 500,
        });
        return response.choices[0].message.content;

    } catch (error) {
        console.error("Error from DeepSeek API:", error);
        return {};
    }
};

/**
 * Automatically scrape multiple product cards from an e-commerce page using DeepSeek LLM for extraction.
 *
 * @param {string} url - The product page URL.
 * @returns {Promise<Array>} - An array of extracted product details.
 */
const scrapeAI = async (url, searchQuery = '', currentPage = 1, limit = 20, summarizeText='') => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    let results = [];
    let hasNextPage = true;

    while (hasNextPage) {
        const cardsText = await page.$$eval('.aec-view', (cards) => {
            return cards.map(card => {
                const price = card.querySelector('.AIC-PI-price-text')?.innerText || "";
                const originalPrice = card.querySelector('.AIC-PI-ori-price-text')?.innerText || "";
                const title = card.querySelector('.AIC-ATM-multiLine')?.innerText || "";
                const rating = card.querySelector('.AIC-OR-text')?.innerText || "";
                const imageUrl = card.querySelector('.AIC-ATM-multiLine img')?.src || "";
                return {
                    price: price,
                    originalPrice: originalPrice,
                    title: title,
                    rating: rating,
                    imageUrl: imageUrl,
                }
            });
        });
        const detailsPage = await browser.newPage();
        for (let item of cardsText) {
            if (item.title !== '') {
                results.push(item);
            }
        }

        await detailsPage.close();

        const nextButton = await page.$('a.page-next, button.page-next'); // selectors may vary on AliExpress
        if (nextButton) {
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                nextButton.click()
            ]);
        } else {
            hasNextPage = false;
        }
    }

    await browser.close();

    results.filter(card => card.title !== '');
    let items = results.slice(0, limit);
    const summarize = await extractWithLLM(summarizeText, JSON.stringify(results));
    return {
        totalRecords: results.length,
        currentPage: currentPage,
        totalPages: Math.round(results.length / limit),
        nextPage: currentPage < Math.round(results.length / limit) ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        summarize,
        data: items
    };
};

exports.scrapeAI = scrapeAI;
