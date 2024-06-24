const Excel = require('../excel');
const HrStopwatch = require('./utils/hr-stopwatch');

const [, , filename] = process.argv;
console.log('filename', filename);

const wb = new Excel.Workbook({
    creator : 'Me',
    lastModifiedBy : 'Her',
    created : new Date(1985, 8, 30),
    modified : new Date(),
    lastPrinted : new Date(2016, 9, 27),
    title: 'Moby Dick',
    subject: 'Whales',
    author: 'Herman Melville',
    manager: 'Dr. Smith',
});

// wb.creator = 'Me';
// wb.lastModifiedBy = 'Her';
// wb.created = new Date(1985, 8, 30);
// wb.modified = new Date();
// wb.lastPrinted = new Date(2016, 9, 27);
// wb.title = 'The Whale';
// wb.subject= 'Whales';
// wb.author='Herman Melville';
// wb.manager= 'Dr. Smith';


const ws = wb.addWorksheet('Foo', {
    headerFooter: {
        firstHeader: 'Hello Exceljs',
        firstFooter: 'Hello World',
    },
});


const now = new Date();
const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDay()
);

ws.columns = [{key: 'date', width: 32}, {key: 'number'}, {key: 'word'}];

const words = [
    'Twas',
    'brillig',
    'and',
    'the',
    'slithy',
    'toves',
    'did',
    'gyre',
    'and',
    'gimble',
    'in',
    'the',
    'wabe',
];

ws.getCell('A1').border = {
    top: {style:'thin'},
    left: {style:'thin'},
    bottom: {style:'thin'},
    right: {style:'thin'},
};

ws.getCell('A1').value = Math.PI;

ws.addTable({
    name: 'TestTable',
    ref: 'B3',
    headerRow: true,
    totalsRow: true,
    style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
    },
    columns: [
        {name: 'Date', totalsRowLabel: 'Totally', filterButton: true},
        {
            name: 'Id',
            totalsRowFunction: 'max',
            filterButton: true,
            totalsRowResult: 8,
        },
        {
            name: 'Word',
            filterButton: false,
            style: {font: {bold: true, name: 'Comic Sans MS'}},
        },
    ],
    rows: words.map((word, i) => [new Date((+today) + (86400 * i)), i, word]),
});


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
