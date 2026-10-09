import ExcelJS from 'exceljs';

/**
 * Generates an Excel file buffer from an array of objects.
 * @param {Array<Object>} data - The data array (e.g. students, placements)
 * @param {Array<Object>} columns - Array of column definitions: [{ header: 'Name', key: 'name', width: 20 }]
 * @param {String} sheetName - The name of the worksheet
 * @returns {Promise<Buffer>} - The generated Excel file buffer
 */
export const generateExcelBuffer = async (data, columns, sheetName = 'Data') => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Set Document Properties
    workbook.creator = 'NEXORA Platform';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    worksheet.columns = columns;

    // Style Header Row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366f1' } // Nexora Primary Color
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add Data Rows
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Write to Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;

  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Failed to generate Excel document');
  }
};
