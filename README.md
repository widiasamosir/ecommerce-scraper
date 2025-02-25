# E-Commerce Scraper with AI Analysis

## Overview
This project is a web scraper designed to extract product details from **AliExpress** or similar e-commerce platforms using **Puppeteer**. The extracted data includes **price, original price, title, rating, image URL, and sales volume**. Additionally, the data is analyzed automatically using **DeepSeek LLM** to identify trends and patterns.

## Features
- **Automated Scraping**: Extracts product details dynamically without hardcoded selectors.
- **Pagination Support**: Scrapes multiple pages to collect a comprehensive dataset.
- **AI-Powered Analysis**: Uses **DeepSeek R1 Distill Llama 8B** to analyze pricing trends, discounts, and sales performance.
- **REST API Endpoint**: Allows querying scraped data via an Express server.

## Tech Stack
- **Node.js**
- **Express.js**
- **Puppeteer** (for web scraping)
- **DeepSeek API** (for AI analysis)

## Installation
### 1. Clone the Repository
```sh
git clone https://github.com/widiasamosir/ecommerce-scraper.git
cd ecommerce-scraper
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file and add your **DeepSeek API key**:
```sh
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Usage
### 1. Start the Express Server
```sh
npm start
```
The server will start at `http://localhost:3000`

### 2. Scrape Data via API
Send a GET request with query parameters `q` (search term), `page`, and `limit`:
```sh
http://localhost:3000/scrape?q=wireless+earbuds&page=1&limit=20
```

### 3. Example API Response
```json
{
  "totalRecords": 100,
  "currentPage": 1,
  "totalPages": 5,
  "nextPage": 2,
  "prevPage": null,
  "data": [
    {
      "title": "Bluetooth Wireless Earbuds",
      "price": "₩20,339",
      "originalPrice": "₩23,419",
      "rating": "4.9",
      "sales": "100K+",
      "imageUrl": "https://example.com/image.jpg"
    }
  ]
}
```

### 4. AI-Powered Analysis
The scraper sends the extracted data to **DeepSeek LLM** for summarization.
#### Example Summarization Output:
```json
{
  "summary": "Lower-priced items (₩1,457) have the highest sales (100K+). Mid-range products (₩20K-₩50K) show moderate sales, while high-end items (₩100K+) have lower sales. Steep discounts (2-3x price cuts) indicate a strategy to attract price-sensitive buyers."
}
```

