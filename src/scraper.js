const puppeteer = require('puppeteer');

// Function to scrape detailed product description from a product page
const scrapeProductDescription = async (url, page) => {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return await page.$eval('.product-description', el => el.innerText).catch(() => '-');
    } catch (error) {
        return '-';
    }
};


// Main scraping function with pagination using "Next" button click
const scrapeAliExpress = async (searchQuery = '', currentPage = 1, limit = 20) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Starting URL from your provided link
    const startUrl = 'https://www.aliexpress.com/ssr/300000556/zQFHEaEPNJ?spm=a2g0o.home.tab.2.617770f46Vy8Kn&disableNav=YES&pha_manifest=ssr&_immersiveMode=true&_gl=1*8hglg*_gcl_au*MTk4NjY2NDUyMC4xNzQwMzg3NDY5*_ga*MTYzOTQ3Nzk4My4xNzQwMzg3NDY5*_ga_VED1YSGNC7*MTc0MDQwMTEwNS4yLjEuMTc0MDQwMTExMS41NC4wLjA.';
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

    let results = [];
    let hasNextPage = true;

    // Continue scraping until the "Next" button is no longer available
    while (hasNextPage) {
        // Wait for the product elements to be loaded
        await page.waitForSelector('.aec-view', { timeout: 5000 }).catch(() => null);

        // Evaluate the page for product items using extractProductDetails logic
        let items = await page.$$eval('.aec-view', (elements) =>
            elements.map(item => {
                // Extract product details from the element
                const details = {
                    price: item.querySelector('.AIC-PI-price-text')?.innerText || '-',
                    originalPrice: item.querySelector('.AIC-PI-ori-price-text')?.innerText || '-',
                    title: item.querySelector('.AIC-ATM-multiLine span:last-child')?.innerText || '-',
                    rating: item.querySelector('.AIC-OR-text')?.innerText || '-',
                    link: item.querySelector('.multi--container a')?.getAttribute('href') || '-'
                };
                return details;
            })
        );

        // Reuse a single extra page for scraping product descriptions
        const detailsPage = await browser.newPage();
        for (let item of items) {
            if (item.link !== '-') {
                item.description = await scrapeProductDescription(item.link, detailsPage);
            } else {
                item.description = '-';
            }
            results.push(item);
        }
        await detailsPage.close();

        // Check for a "next" button and click it if available
        const nextButton = await page.$('a.page-next, button.page-next'); // selectors may vary on AliExpress
        if (nextButton) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                nextButton.click()
            ]);
        } else {
            hasNextPage = false;
        }
    }
    const totalPages = hasNextPage ? currentPage + 1 : currentPage; // For demonstration
    let items = results.slice(0, limit);

    await browser.close();
    return {
        totalRecords: results.length,
        currentPage: currentPage,
        totalPages: totalPages,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        data: items
    };
};

module.exports = { scrapeAliExpress };
