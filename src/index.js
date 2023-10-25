// Wczytanie pliku .env, w którym przechowujemy ukryte zmienne środowiskowe
require('dotenv').config();

// Wymagane biblioteki
const puppeteer = require('puppeteer'); // Automatyzacja przeglądarek
const cheerio = require('cheerio'); // Biblioteka do parsowania HTML
const express = require('express'); // Framework aplikacji webowych

// Customowe moduły
const {uploadNewHotShot} = require('./database');
const {logger, fixPrice, regexList} = require('./utils.js');

const app = express();

// Obiekt przechowujący dane o produkcie
const hotshotObject = {
    name: '', // Nazwa produktu
    prices: {
        normal: 0, // Cena normalna
        omnibus: 0, // Dyrektywa omnibus
        hotshot: 0 // Cena z GS
    },
    sku: 0, // SKU produktu
    thumbnail: '' // URL miniaturki
};

// Pobieranie wartości z .env i przechowywanie ich w zmiennych
const port = process.env.PORT; // Port serwera
const interval = process.env.INTERVAL;

// Zmienna pod Puppeteer (do kontroli przeglądarki)
let browser;

// Inicjowanie Puppeteer (automatyzacja przeglądarek)
async function initializeBrowser() {
    try {
        browser = await puppeteer.launch({headless: "new"});
        logger.info('Puppeteer zainicjowany.');
        await fetchHotshotData();
    } catch (e) {
        logger.error('Wystąpił błąd podczas inicjalizacji przeglądarki:', e);
    }
}

// Scrapowanie strony z produktem
async function updateHotShot() {
    const page = await browser.newPage();
    logger.debug('Otworzono nową stronę.');
    try {
        await page.goto('https://www.x-kom.pl/goracy_strzal', {timeout: 30000});
        await page.waitForSelector('h2', {timeout: 10000});
        logger.debug("Strona została wczytana do pamięci.")
        logger.info(page.content());
        return await page.content();
    } catch (e) {
        if (e.name === 'TimeoutError') {
            logger.error('Upłynął limit czasu obsługi żądania.');
        } else {
            logger.error('Napotkano problem podczas wczytywania strony:', e);
        }
        throw e;
    } finally {
        await page.close();
        logger.debug('Strona została zamknięta.');
    }
}


// Aktualizacja danych o produkcie po wejściu na stronę główną
// app.get('/', async (req, res) => {
const fetchHotshotData = async () => {
    try {
        // Wczytanie HTML strony do zmiennej
        const html = await updateHotShot();
        const $ = cheerio.load(html); // Załaduj HTML do parsera Cheerio

        // Wyciągniecie nazwy produktu na stronie
        hotshotObject.name = $('h1[data-name="productTitle"]').text();

        // Wyciągnięcie SKU oraz cen
        $('div').each((divIndex, element) => {
            const priceText = $(element).text();

            if (regexList.sku.test(priceText)) {
                const skuMatch = priceText.match(regexList.sku)[0];
                hotshotObject.sku = skuMatch.replaceAll('"', '').replace('sku:', ''); // Wyciągnij numer SKU produktu
            }

            const regex = regexList.prices;
            const price = hotshotObject.prices;

            // Sprawdź i wyciągnij ceny z wykorzystaniem wyrażeń regularnych
            Object.keys(regex).forEach(key => {
                if (regex[key].test(priceText)) {
                    price[key] = fixPrice(priceText.replace(regex[key], '')); // Przekształć i zapisz cenę
                }
            });
        });

        // Wyciągnij URL miniaturki produktu
        $('img').each((index, element) => {
            if ($(element).attr('alt').match(hotshotObject.sku)) {
                hotshotObject.thumbnail = $(element).attr('src');
                return false;
            }
        });
    } catch (e) {
        logger.error('Wystąpił błąd podczas pobierania danych gorącego strzału:', e);
    }
};


// Zaktualizuj wywołanie initializeBrowser w funkcji uruchamianej po starcie serwera
app.listen(port, async () => {
    try {
        logger.info(`Aplikacja jest uruchomiona na porcie: ${port}`);
    } catch (e) {
        logger.error('Wystąpił błąd podczas inicjalizacji serwera:', e);
    }
});

app.get('/api/update', async (req, res) => {
    // Send a JSON response with the hotshotObject
    await initializeBrowser();
    await uploadNewHotShot(hotshotObject);

    res.json(hotshotObject);
});

app.get('/api/test', async (req, res) => {
    // Send a JSON response with the hotshotObject
    await initializeBrowser();

    res.json(hotshotObject);
});


module.exports = app;