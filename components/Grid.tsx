import React, { useRef } from 'react';
import clsx from 'clsx';
import { RowData, ValidationError } from '../types';
import { TearEffect } from './TearEffect';
import { getColumnLabel } from '../constants';

interface GridProps {
  data: RowData[];
  errors: ValidationError[];
  activeError: ValidationError | null;
  onCellClick: (rowIndex: number, colIndex: number) => void;
  onCloseError: () => void;
}

export const Grid: React.FC<GridProps> = ({
  data,
  errors,
  activeError,
  onCellClick,
  onCloseError,
}) => {
  // Helper to find error for a specific cell
  const getError = (r: number, c: number) => errors.find((e) => e.rowIndex === r && e.colIndex === c);

  // Determine max columns to render (based on data or default to at least 10)
  const maxCols = Math.max(10, ...data.map(r => r.length));
  
  // Create an array of column indices
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);

  // We need a ref for the scroll container to ensure the tear effect width matches the scroll width
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 overflow-auto bg-gray-100 relative" ref={containerRef} onClick={onCloseError}>
      {/* Table Structure */}
      <div className="inline-block min-w-full align-middle relative">
        <table className="min-w-full border-collapse table-fixed bg-white shadow-sm">
          {/* Header */}
          <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="w-12 border border-gray-300 bg-gray-100 text-gray-500 font-medium text-xs p-2 text-center select-none">
                #
              </th>
              {colIndices.map((colIdx) => (
                <th
                  key={colIdx}
                  className="w-32 border border-gray-300 px-2 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider select-none relative group"
                >
                  <div className="flex justify-center">{getColumnLabel(colIdx)}</div>
                  {/* Resize handle visual (not functional in this demo) */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400" />
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white">
            {data.map((row, rowIndex) => {
              const isRowExpanded = activeError?.rowIndex === rowIndex;

              return (
                <React.Fragment key={rowIndex}>
                  {/* The Actual Row */}
                  <tr className={clsx("group transition-colors", isRowExpanded ? "bg-gray-50" : "hover:bg-blue-50/30")}>
                    {/* Row Index Number */}
                    <td className="border border-gray-300 bg-gray-50 text-center text-xs font-semibold text-gray-500 select-none">
                      {rowIndex + 1}
                    </td>

                    {/* Cells */}
                    {colIndices.map((colIdx) => {
                      const cellValue = row[colIdx];
                      const error = getError(rowIndex, colIdx);
                      const isErrorCell = !!error;
                      const isSelected = activeError?.rowIndex === rowIndex && activeError?.colIndex === colIdx;

                      return (
                        <td
                          key={`${rowIndex}-${colIdx}`}
                          onClick={(e) => {
                            if (isErrorCell) {
                                e.stopPropagation();
                                onCellClick(rowIndex, colIdx);
                            }
                          }}
                          className={clsx(
                            "border border-gray-300 text-sm px-2 py-1.5 whitespace-nowrap overflow-hidden text-ellipsis cursor-default transition-all duration-200 relative",
                            {
                              "bg-red-50 hover:bg-red-100 cursor-pointer": isErrorCell && !isSelected,
                              "bg-red-100 ring-2 ring-inset ring-red-500 z-10": isSelected, // Active Error State
                              "text-gray-400 italic": cellValue === null || cellValue === undefined || cellValue === '',
                            }
                          )}
                          title={isErrorCell ? "Click to see error details" : String(cellValue)}
                        >
                          {/* Cell Content */}
                          {cellValue === null || cellValue === undefined || cellValue === '' 
                            ? '(empty)' 
                            : String(cellValue)}

                          {/* Error Indicator Dot */}
                          {isErrorCell && (
                             <span className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-red-500 border-r-transparent transform rotate-0" />
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* The Tear Reveal Row */}
                  {isRowExpanded && activeError && (
                    <tr>
                      {/* Removed padding and borders to allow the tear effect to span the full width cleanly */}
                      <td colSpan={maxCols + 1} className="p-0 border-0">
                         <TearEffect 
                            message={activeError.message} 
                            onClose={onCloseError} 
                            width="100%"
                         />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Empty State filler */}
            {data.length === 0 && (
                <tr>
                    <td colSpan={maxCols + 1} className="h-64 text-center text-gray-400">
                        No data loaded. Import an Excel file or use the sample.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};