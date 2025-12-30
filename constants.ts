import { ColumnSchema, ColumnType } from './types';

// Default schema for demonstration
export const INITIAL_SCHEMA: ColumnSchema[] = [
  { index: 0, name: 'ID', type: ColumnType.NUMBER, required: true },
  { index: 1, name: 'Name', type: ColumnType.STRING, required: true },
  { index: 2, name: 'Age', type: ColumnType.NUMBER, required: false },
  { index: 3, name: 'Is Active', type: ColumnType.BOOLEAN, required: true },
  { index: 4, name: 'Join Date', type: ColumnType.DATE, required: false },
];

export const INITIAL_DATA = [
  [101, 'Alice Johnson', 28, true, '2023-01-15'],
  [102, 'Bob Smith', 'InvalidAge', false, '2023-02-20'], // Error: Age should be number
  [103, '', 35, true, '2023-03-10'], // Error: Name required
  [104, 'Diana Prince', 30, true, '2023-04-05'],
];

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const getColumnLabel = (index: number): string => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = ALPHABET[i % 26] + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};