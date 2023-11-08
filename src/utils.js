const winston = require("winston");

// Function to remove currency symbols, commas, and spaces from a string
const fixPrice = (data) => {
    const currencyPattern = /zł/g;
    const commaPattern = /,/g;
    const percentPattern = /%/g;
    const spacePattern = /\s/g;

    data = data.replace(currencyPattern, '')
        .replace(commaPattern, '.')
        .replace(spacePattern, '');

    if (data.includes('%')) {
        data = data.replace(percentPattern, '') / 1000;
    }

    return data;
};

// Regular expressions for various data patterns
const regexList = {
    sku: /"sku":"\d+"/,
    prices: {
        normal: /\szł\s-\scena\sregularna$/,
        omnibus: /^Najniższa\scena\sz\s30\sdni\sprzed\sobniżką:\s/,
        hotshot: /\szłOszczędź\s.+\szł$/
    },
};

// Function to get the current date in "DD-MM-YYYY" format
const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Create a logger with timestamp and colorized output
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.label({ label: '[LOGS]' }),
        winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        winston.format.printf(info => `${info.label} ${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: `logs/${getCurrentDate()}.log`
        })
    ],
});

module.exports = {
    fixPrice,
    regexList,
    logger
};
