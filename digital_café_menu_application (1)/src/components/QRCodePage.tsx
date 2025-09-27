import { useState } from "react";
import QRCode from "qrcode";

interface QRCodePageProps {
  onBack: () => void;
}

export function QRCodePage({ onBack }: QRCodePageProps) {
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [qrCodes, setQrCodes] = useState<{ table: number; url: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTableSelect = (table: number) => {
    setSelectedTables(prev => 
      prev.includes(table) 
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  const generateQRCodes = async () => {
    setIsGenerating(true);
    const codes = [];
    
    for (const table of selectedTables) {
      const url = `${window.location.origin}?table=${table}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#d97706',
            light: '#ffffff'
          }
        });
        codes.push({ table, url: qrDataUrl });
      } catch (error) {
        console.error(`Error generating QR code for table ${table}:`, error);
      }
    }
    
    setQrCodes(codes);
    setIsGenerating(false);
  };

  const printQRCodes = () => {
    window.print();
  };

  const selectAllTables = () => {
    const allTables = Array.from({ length: 50 }, (_, i) => i + 1);
    setSelectedTables(allTables);
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-amber-800 mb-2">QR Code Generator</h1>
              <p className="text-gray-600">Generate QR codes for CHA VALA table ordering</p>
            </div>
            <button
              onClick={onBack}
              className="text-amber-600 hover:text-amber-800 font-medium"
            >
              ← Back
            </button>
          </div>

          {qrCodes.length === 0 ? (
            <div className="space-y-6">
              {/* Table Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Select Tables</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllTables}
                      className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-10 gap-2 mb-4">
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((table) => (
                    <button
                      key={table}
                      onClick={() => handleTableSelect(table)}
                      className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                        selectedTables.includes(table)
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {table}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Selected: {selectedTables.length} tables
                </p>

                <button
                  onClick={generateQRCodes}
                  disabled={selectedTables.length === 0 || isGenerating}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    `Generate QR Codes (${selectedTables.length})`
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Generated QR Codes ({qrCodes.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={printQRCodes}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => {
                      setQrCodes([]);
                      setSelectedTables([]);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Generate New
                  </button>
                </div>
              </div>

              {/* QR Codes Grid */}
              <div className="print-qr grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrCodes.map(({ table, url }) => (
                  <div key={table} className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-amber-800 mb-1">CHA VALA</h4>
                      <p className="text-lg font-semibold text-gray-700">Table {table}</p>
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <img src={url} alt={`QR Code for Table ${table}`} className="w-48 h-48" />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Scan to Order</p>
                      <p>Quick & Easy Digital Menu</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
