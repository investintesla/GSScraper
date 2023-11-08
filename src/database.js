const mysql2 = require('mysql2/promise'); // Use the promise-based version
const { dbConfig } = require('./config.js');
const { logger } = require('./utils.js');

const pool = mysql2.createPool({ ...dbConfig, waitForConnections: true });

const SQL_INSERT_STATEMENT = `
    IF NOT EXISTS ( SELECT 1 FROM hotshot_table WHERE sku = ? AND promotionStart = ? ) THEN
    INSERT INTO hotshot_table (sku, price, oldPrice, minPrice, amount, itemName, thumbnailUrl, promotionStart, promotionEnd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); end if`;

// Function to insert a new hotshot into the database
const insertHotShot = async (hotshotObject) => {
    try {
        if (hotshotObject.sku === 0) {
            logger.error('Gorący strzał nie został dodany do bazy danych, SKU produktu == 0.');
            return;
        }

        const connection = await pool.getConnection();

        const price = hotshotObject.prices.price;
        const oldPrice = hotshotObject.prices.oldPrice;
        const minPrice = hotshotObject.prices.minPrice;

        const sku = hotshotObject.sku;
        const amount = hotshotObject.amount;
        const itemName = hotshotObject.itemName;
        const thumbnailUrl = hotshotObject.thumbnailUrl;

        const promotionStart = hotshotObject.promotionStart;
        const promotionEnd = hotshotObject.promotionEnd;

        const values = [sku, promotionStart, sku, price, oldPrice, minPrice, amount, itemName, thumbnailUrl, promotionStart, promotionEnd];

        // Execute the SQL query with proper error handling
        const [results] = await connection.query(SQL_INSERT_STATEMENT, values);

        if (results.affectedRows === 0) {
            logger.warn('Ten gorący strzał znajduje się już w bazie danych.');
        } else {
            logger.info('Gorący strzał został dodany do bazy danych.');
        }

        connection.release();
    } catch (error) {
        logger.error('An error occurred during database operation:', error);
    }
};

async function fetchPaginatedData(offset, itemsPerPage) {
    try {
        const sqlQuery = `SELECT * FROM hotshot_table ORDER BY promotionStart DESC LIMIT ? OFFSET ?;`;

        const queryParams = [itemsPerPage, offset];

        const connection = await pool.getConnection();
        const [results] = await connection.query(sqlQuery, queryParams);

        connection.release();

        return results;
    } catch (error) {
        logger.error('An error occurred during database operation:', error);
        throw error;
    }
}

async function getTotalItemCount() {
    try {
        const sqlQuery = 'SELECT COUNT(*) AS total_count FROM hotshot_table;';
        const connection = await pool.getConnection();
        const [result] = await connection.query(sqlQuery);
        connection.release();

        return result[0].total_count;
    } catch (error) {
        logger.error('An error occurred during database operation:', error);
        throw error;
    }
}
module.exports = {
    insertHotShot,
    fetchPaginatedData,
    getTotalItemCount
};
