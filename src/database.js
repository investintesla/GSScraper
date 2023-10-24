const mysql2 = require('mysql2');
const {dbConfig} = require('./config.js');
const {logger} = require('./utils.js');

// Inicjalizacja połączenia z bazą danych
const initializeDatabase = () => {
    const dbConnection = mysql2.createConnection(dbConfig);
    dbConnection.connect((err) => {
        if (err) {
            logger.error('Wystąpił problem podczas łączenia z bazą danych:', err);
            throw err;
        }
        logger.info('Połączono z bazą danych.');
    });
    return dbConnection;
};

const SQL_INSERT_STATEMENT = `IF NOT EXISTS ( SELECT 1 FROM hotshots WHERE name = ? AND sku = ? AND thumbnail_url = ? AND created_at >= NOW() - INTERVAL 12 HOUR ) THEN INSERT INTO hotshots (name, normal_price, omnibus_price, hotshot_price, sku, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?); end if`;

// Funkcja do przesyłania nowego gorącego strzału do bazy danych
const uploadNewHotShot = async (hotshotObject) => {

    const dbConnection = await initializeDatabase();

    const name = hotshotObject.name;
    const normal_price = hotshotObject.prices.normal;
    const hotshot_price = hotshotObject.prices.hotshot;
    const omnibus_price = hotshotObject.prices.omnibus;
    const sku = hotshotObject.sku;
    const thumbnail_url = hotshotObject.thumbnail;

    const values = [name, sku, thumbnail_url, name, normal_price, omnibus_price, hotshot_price, sku, thumbnail_url];

    // Wykonaj zapytanie SQL w bazie danych
    dbConnection.query(SQL_INSERT_STATEMENT, values, (err, results) => {
        if (err) {
            logger.error('Napotkano problem podczas przetwarzania zapytania:', err);
            dbConnection.close();
            logger.info("Połączenie z bazą danych zamknięte");
            return;
        } else {
            logger.info("Zapytanie zostało prawidłowo wykonane!");
        }

        logger.debug(JSON.stringify(results));

        // Sprawdź, czy dodawanie do bazy danych się powiodło
        if (results["affectedRows"] === 0) {
            logger.warn("Ten gorący strzał znajduje się już w bazie danych.");
        } else {
            logger.info("Gorący strzał został dodany do bazy danych!");
        }

        dbConnection.close();
        logger.info("Połączenie z bazą danych zamknięte");
    });
}

module.exports = {
    initializeDatabase,
    uploadNewHotShot
};
