const winston = require("winston");
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


const regexList = {
    sku: /"sku":"\d+"/,
    prices: {
        normal: /\szł\s-\scena\sregularna$/,
        omnibus: /^Najniższa\scena\sz\s30\sdni\sprzed\sobniżką:\s/,
        hotshot: /\szłOszczędź\s.+\szł$/
    },
};

const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// https://stackoverflow.com/a/52650695
let alignColorsAndTime = winston.format.combine(
    winston.format.label({
        label: '[LOGGER]'
    }),
    winston.format.timestamp({
        format: "DD-MM-YYYY HH:mm:ss"
    }),
    winston.format.printf(
        info => `${info.timestamp} (${info.level}) » ${info.message}`
    )
);

const logFilename = `logs/${getCurrentDate()}.log`;

const logger = winston.createLogger({
    level: "debug",
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
        }),
        new winston.transports.File({
            format: winston.format.combine(alignColorsAndTime),
            filename: logFilename
        })
    ],
});


module.exports = {
    fixPrice,
    regexList,
    getCurrentDate,
    logger
};