import React from 'react';
import { ColumnSchema, ColumnType } from '../types';
import { Trash2, Plus, X } from 'lucide-react';
import { getColumnLabel } from '../constants';

interface SchemaConfigProps {
  isOpen: boolean;
  onClose: () => void;
  schema: ColumnSchema[];
  setSchema: (schema: ColumnSchema[]) => void;
}

export const SchemaConfig: React.FC<SchemaConfigProps> = ({
  isOpen,
  onClose,
  schema,
  setSchema,
}) => {
  if (!isOpen) return null;

  const handleAddRule = () => {
    setSchema([
      ...schema,
      {
        index: schema.length,
        name: `Column ${getColumnLabel(schema.length)}`,
        type: ColumnType.STRING,
        required: false,
      },
    ]);
  };

  const handleRemoveRule = (indexToRemove: number) => {
    setSchema(schema.filter((_, idx) => idx !== indexToRemove));
  };

  const updateRule = (index: number, updates: Partial<ColumnSchema>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    setSchema(newSchema);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Validation Rules</h2>
            <p className="text-sm text-gray-500 mt-1">Define format rules for your Excel columns.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {schema.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No rules defined. Click "Add Column Rule" to start.
            </div>
          ) : (
            schema.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md font-mono text-sm font-bold text-gray-600">
                  {getColumnLabel(rule.index)}
                </div>
                
                <div className="flex-1 grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Col Name</label>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => updateRule(idx, { name: e.target.value })}
                      className="w-full mt-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Data Type</label>
                    <select
                      value={rule.type}
                      onChange={(e) => updateRule(idx, { type: e.target.value as ColumnType })}
                      className="w-full mt-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {Object.values(ColumnType).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col justify-center items-center">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2">Required</label>
                    <input
                      type="checkbox"
                      checked={rule.required}
                      onChange={(e) => updateRule(idx, { required: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                   
                   {/* Col Index Mapper (for advanced use, simple manual input for now) */}
                   <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Index</label>
                    <input
                      type="number"
                      min={0}
                      value={rule.index}
                      onChange={(e) => updateRule(idx, { index: parseInt(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveRule(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handleAddRule}
            className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Column Rule
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-transform active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};