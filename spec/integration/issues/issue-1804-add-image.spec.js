const ExcelJS = verquire('exceljs');

// Test for issue #1804: Wrong image added when reusing same image multiple times
// https://github.com/exceljs/exceljs/issues/1804
// https://github.com/exceljs/exceljs/pull/2876

const TEST_XLSX_FILE_NAME = './spec/out/wb-issue-1804.test.xlsx';
const IMAGE_FILENAME1 = `${__dirname}/../data/image.png`;
const IMAGE_FILENAME2 = `${__dirname}/../data/image1.jpg`;

describe('github issues', () => {
  it('issue 1804 - wrong image when reusing same image multiple times', () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');

    // Add two different images
    const img1 = wb.addImage({
      filename: IMAGE_FILENAME1,
      extension: 'png',
    });

    const img2 = wb.addImage({
      filename: IMAGE_FILENAME2,
      extension: 'jpeg',
    });

    // Add images in order: img2, img1, img1
    // Before fix: third image would incorrectly become img2
    // After fix: third image correctly stays as img1
    ws.addImage(img2, 'A1:A1');
    ws.addImage(img1, 'A3:A3');
    ws.addImage(img1, 'A5:A5'); // This is the problematic one

    // Add labels for verification
    ws.getRow(1).getCell(2).value = 'image2';
    ws.getRow(3).getCell(2).value = 'image1';
    ws.getRow(5).getCell(2).value = 'image1';

    return wb.xlsx
      .writeFile(TEST_XLSX_FILE_NAME)
      .then(() => {
        const wb2 = new ExcelJS.Workbook();
        return wb2.xlsx.readFile(TEST_XLSX_FILE_NAME);
      })
      .then(wb2 => {
        const ws2 = wb2.getWorksheet('Sheet1');
        // Verify that images at A3 and A5 have the same imageId (both should be img1)
        expect(ws2._media[1].imageId).to.equal(ws2._media[2].imageId);
        // Verify that first image (A1) has different imageId (should be img2)
        expect(ws2._media[0].imageId).to.not.equal(ws2._media[1].imageId);
      });
  }).timeout(6000);
});
