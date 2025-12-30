import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Grid } from './components/Grid';
import { SchemaConfig } from './components/SchemaConfig';
import { INITIAL_DATA, INITIAL_SCHEMA } from './constants';
import { ColumnSchema, RowData, ValidationError } from './types';
import { validateData, parseExcelFile } from './services/excelService';
import { FileSpreadsheet, Settings, Upload, CheckCircle, AlertTriangle, Download } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [data, setData] = useState<RowData[]>(INITIAL_DATA);
  const [schema, setSchema] = useState<ColumnSchema[]>(INITIAL_SCHEMA);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [activeError, setActiveError] = useState<ValidationError | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate whenever data or schema changes
  useEffect(() => {
    const newErrors = validateData(data, schema);
    setErrors(newErrors);
    
    // If the active error is no longer valid, close it
    if (activeError) {
        const stillExists = newErrors.find(e => e.rowIndex === activeError.rowIndex && e.colIndex === activeError.colIndex);
        if (!stillExists) setActiveError(null);
    }
  }, [data, schema]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      setActiveError(null);
      // Reset file input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Failed to parse Excel file", err);
      alert("Error parsing file. Please check if it is a valid Excel file.");
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "validated_data.xlsx");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg text-white shadow-sm">
                <FileSpreadsheet size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Excel Validator</h1>
                <p className="text-xs text-gray-500 font-medium">Import, Validate, Correct</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md mr-4">
                {errors.length > 0 ? (
                    <>
                        <AlertTriangle size={16} className="text-red-500" />
                        <span className="text-sm font-semibold text-red-600">{errors.length} Issues Found</span>
                    </>
                ) : (
                    <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-semibold text-green-600">All Data Valid</span>
                    </>
                )}
            </div>

            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <Settings size={18} />
              Schema Rules
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Upload size={18} />
              Import Excel
            </button>
             <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Download current data"
            >
                <Download size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
         <div className="absolute inset-0 bg-repeat opacity-5 pointer-events-none z-0" 
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
         ></div>
         
         {/* Validation Summary Bar (Mobile only or extra info) */}
         {errors.length > 0 && (
             <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-center text-sm text-red-800 z-10">
                 Click on the <span className="font-bold text-red-600">Red Cells</span> to reveal the "Torn Paper" error detail effect.
             </div>
         )}

         {/* Grid Component */}
         <div className="flex-1 relative z-10 flex flex-col">
            <Grid 
                data={data}
                errors={errors}
                activeError={activeError}
                onCellClick={(r, c) => {
                    // Toggle error: if clicking same, close it. If different, open it.
                    if (activeError?.rowIndex === r && activeError.colIndex === c) {
                        setActiveError(null);
                    } else {
                        const error = errors.find(e => e.rowIndex === r && e.colIndex === c);
                        if (error) setActiveError(error);
                    }
                }}
                onCloseError={() => setActiveError(null)}
            />
         </div>
      </main>

      {/* Schema Config Modal */}
      <SchemaConfig 
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        schema={schema}
        setSchema={setSchema}
      />
    </div>
  );
};

export default App;