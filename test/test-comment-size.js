const Excel = require('../lib/exceljs.nodejs');
const HrStopwatch = require('./utils/hr-stopwatch');

const [, , filename] = process.argv;

const wb = new Excel.Workbook();
const ws = wb.addWorksheet('Foo');
ws.getCell('B2').value = 5;
ws.getCell('B2').note = {
    texts: [
        {
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        },
    ],
    size: {
        rows: 10,
        cols: 10,
    },
};

ws.getCell('D2').value = 'Zoo';
ws.getCell('D2').note = 'Plain Text Comment';

const stopwatch = new HrStopwatch();
stopwatch.start();
wb.xlsx
    .writeFile(filename)
    .then(() => {
        const micros = stopwatch.microseconds;
        console.log('Done.');
        console.log('Time taken:', micros);
    })
    .catch(error => {
        console.log(error.message);
    });
