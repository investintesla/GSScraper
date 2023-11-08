// Load environment variables from a .env file
require('dotenv').config();

// Import required libraries and modules
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra');
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// Import the insertHotShot function and logger utility
const { insertHotShot, getTotalItemCount, fetchPaginatedData } = require('./database');
const { logger } = require('./utils');

// Define constants for URL, User-Agent, and selector
let url, UA, selector;

url = 'https://www.x-kom.pl/goracy_strzal';
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36';
selector = 'h2';

// Initialize HTTPS flag (default to true if not defined in the environment)
let enablehttps = process.env.HTTPS_ENABLED || true;

// Create an instance of the Express application
const app = express();

// Initialize the hotshotObject with default values
let hotshotObject = {
    sku: null,
    prices: {
        price: null,
        oldPrice: null,
        minPrice: null,
    },
    amount: null,
    itemName: null,
    thumbnailUrl: null,
    promotionStart: null,
    promotionEnd: null,
};

// Use Puppeteer StealthPlugin to prevent detection
puppeteer.use(StealthPlugin());

// Function to scrape data from a web page
async function scrapData() {
    try {
        // Launch a headless browser using Puppeteer
        const browser = await puppeteer.launch({ headless: 'new' });

        // Create a new incognito browser context
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        // Regular expression to match specific data in the web page
        const regex = /window\.__INITIAL_STATE__\['app'] = .*}/gm;

        // Configure the page settings
        await page.setCacheEnabled(false);
        await page.setUserAgent(UA);
        await page.goto(url);
        await page.waitForSelector(selector);

        // Get the HTML content of the page
        let html = await page.content();

        // Extract and parse data from the HTML content
        let match = html.match(regex)[0];
        match = match.replace('window.__INITIAL_STATE__[\'app\'] = ', "");
        const hotshotData = JSON.parse(match);

        // Extract specific data fields
        const hotshotExtend = hotshotData['productsLists']['hotShot']['0']['extend'];
        const sku = hotshotData['productsLists']['hotShot']['0']['id'];
        const price = hotshotExtend['price'];
        const oldPrice = hotshotExtend['oldPrice'];
        const minPrice = hotshotExtend['minPriceInfo']['minPrice'];
        const amount = hotshotExtend['promotionTotalCount'];
        const itemName = hotshotExtend['promotionName'];
        const thumbnailUrl = hotshotExtend['promotionPhoto']['url'];
        const promotionStart = hotshotExtend['promotionStart'];
        const promotionEnd = hotshotExtend['promotionEnd'];

        // Close the browser and browser context
        await page.close();
        await context.close();
        await browser.close();

        // Return the extracted data as an object
        return {
            sku: sku,
            prices: {
                price: price,
                oldPrice: oldPrice,
                minPrice: minPrice,
            },
            amount: amount,
            itemName: itemName,
            thumbnailUrl: thumbnailUrl,
            promotionStart: promotionStart,
            promotionEnd: promotionEnd
        };
    } catch (error) {
        // Handle and log errors
        logger.error('Error in scrapData:', error);
        throw error;
    }
}

// Function to test and update hotshot data
async function test() {
    try {
        // Scrape data and store it in the hotshotObject
        hotshotObject = await scrapData();

        // Check if SKU is 0, indicating a scraping error
        if (hotshotObject.sku === 0) {
            logger.error('SKU == 0; Scraping error! Check logs for details.');
            return;
        }

        // Log the hotshotObject data as JSON
        logger.info(JSON.stringify(hotshotObject));
    } catch (error) {
        // Handle and log errors
        logger.error('Error while updating hotshot object ', error);
    }
}

app.use(cors());

// Define routes for the Express application

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json('Aplikacja jest uruchomiona.');
});

// Endpoint to test and upload hotshot data
app.get('/api/upload', async (req, res) => {
    try {
        // Test and update hotshot data
        await test();

        // Insert the hotshotObject into the database
        await insertHotShot(hotshotObject);

        // Respond with the hotshotObject as JSON
        res.json(hotshotObject);
    } catch (error) {
        // Handle and log errors
        logger.error("Error in /api/upload:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to test and retrieve hotshot data
app.get('/api/test', async (req, res) => {
    try {
        // Test and update hotshot data
        await test();

        // Respond with the hotshotObject as JSON
        res.json(hotshotObject);
    } catch (error) {
        // Handle and log errors
        logger.error("Error in /api/test:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to get list of last hotshots
app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.items_per_page) || 10;

        // Calculate the offset based on the page and itemsPerPage
        const offset = (page - 1) * itemsPerPage;

        // Use your SQL query to fetch paginated data
        // Replace the following line with your actual SQL query logic
        const paginatedData = await fetchPaginatedData(offset, itemsPerPage);

        // Retrieve the total count of items (for metadata)
        // Replace the following line with your actual SQL query logic
        const totalCount = await getTotalItemCount();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // Create a response object with data and metadata
        const response = {
            data: paginatedData,
            metadata: {
                page,
                itemsPerPage,
                totalPages,
                totalItems: totalCount,
            },
        };

        res.json(response);
    } catch (error) {
        // Handle errors, e.g., database connection issues
        logger.error("Error in /api/products:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create an HTTP server and listen on port 80
const _http = app.listen(80, async () => {
    try {
        logger.info(`App listening on :80`);
    } catch (e) {
        // Handle and log errors
        logger.error('Error on creating (http:80) app instance:', e);
    }
});

// Paths to SSL/TLS certificate files
const privateKeyDir = '/etc/letsencrypt/live/api.purpurmc.pl/privkey.pem';
const certificateDir = '/etc/letsencrypt/live/api.purpurmc.pl/fullchain.pem';
const caDir = '/etc/letsencrypt/live/api.purpurmc.pl/chain.pem';

// Check if SSL/TLS certificate files exist
const pathsToCheck = [privateKeyDir, certificateDir, caDir];
for (const element of pathsToCheck) {
    if (!fs.existsSync(element)) {
        enablehttps = false;
    }
}

// Create an HTTPS server if enabled
let _https;
if (enablehttps) {
    // Read SSL/TLS certificate files
    const privateKey = fs.readFileSync(privateKeyDir, 'utf8');
    const certificate = fs.readFileSync(certificateDir, 'utf8');
    const ca = fs.readFileSync(caDir, 'utf8');

    // Create credentials for HTTPS
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    // Create an HTTPS server and listen on port 443
    _https = https.createServer(credentials, app);
    _https.listen(443, () => {
        try {
            logger.info('App listening on :443');
        } catch (e) {
            // Handle and log errors
            logger.error('Error on creating (https:443) app instance:', e);
        }
    });
}

// Export the Express application
module.exports = app;
