import * as XLSX from 'xlsx';
import { ColumnSchema, ColumnType, RowData, ValidationError } from '../types';

export const parseExcelFile = async (file: File): Promise<RowData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as RowData[];
        
        // Remove header row if it exists (simple heuristic: assume first row is header)
        // In a real app, we might ask the user. For now, we keep raw data and let user handle mapping
        // We will just return the raw rows.
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const validateData = (rows: RowData[], schema: ColumnSchema[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  rows.forEach((row, rowIndex) => {
    // Skip empty rows usually, but let's validate strictly based on schema
    if (row.length === 0 && schema.length > 0) {
       // Optional: Decide if completely empty rows are errors. Let's skip them for UX.
       return; 
    }

    schema.forEach((rule) => {
      const cellValue = row[rule.index];
      const cellStr = cellValue === undefined || cellValue === null ? '' : String(cellValue).trim();

      // 1. Required Check
      if (rule.required && cellStr === '') {
        errors.push({
          rowIndex,
          colIndex: rule.index,
          message: `Column '${rule.name}' is required but was empty.`,
        });
        return; // Stop further checks for this cell if missing
      }

      // Skip type check if empty and not required
      if (cellStr === '') return;

      // 2. Type Check
      switch (rule.type) {
        case ColumnType.NUMBER:
          if (isNaN(Number(cellValue))) {
            errors.push({
              rowIndex,
              colIndex: rule.index,
              message: `Expected a Number, got '${cellValue}'.`,
            });
          }
          break;
        case ColumnType.BOOLEAN:
          const lower = cellStr.toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
            errors.push({
              rowIndex,
              colIndex: rule.index,
              message: `Expected Boolean (true/false), got '${cellValue}'.`,
            });
          }
          break;
        case ColumnType.DATE:
          const date = Date.parse(cellStr);
          if (isNaN(date)) {
             errors.push({
              rowIndex,
              colIndex: rule.index,
              message: `Expected a valid Date, got '${cellValue}'.`,
            });
          }
          break;
        case ColumnType.STRING:
        default:
          // Strings are usually valid unless there's a specific regex (not implemented here)
          break;
      }
    });
  });

  return errors;
};