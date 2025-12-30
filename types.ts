export type CellValue = string | number | boolean | null;

export type RowData = CellValue[];

export enum ColumnType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
}

export interface ColumnSchema {
  index: number;
  name: string;
  type: ColumnType;
  required: boolean;
}

export interface ValidationError {
  rowIndex: number;
  colIndex: number;
  message: string;
}

export interface SpreadsheetData {
  rows: RowData[];
  columns: string[]; // Column headers (A, B, C...)
}