import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { DocumentType } from '../types';

interface DocumentUploaderProps {
  onDocumentAdded: (doc: {
    type: DocumentType;
    documentNumber: string;
    fileName: string;
    fileSize: string;
    fileData?: string;
  }) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentAdded }) => {
  const [docType, setDocType] = useState<DocumentType>('BI');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('O ficheiro é demasiado grande (máximo 10MB).');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: e.target?.result as string
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor seleccione ou arraste um ficheiro de documento.');
      return;
    }

    onDocumentAdded({
      type: docType,
      documentNumber: docNumber.trim() || 'DOC-' + Math.floor(100000 + Math.random() * 900000),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileData: selectedFile.dataUrl
    });

    // Reset local state
    setSelectedFile(null);
    setDocNumber('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          Anexar Documentos Oficiais (BI, Passaporte ou Cartão de Saúde)
        </h4>
        <span className="text-xs text-gray-500 font-medium">Formatos: PDF, JPG, PNG</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Documento</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="BI">Bilhete de Identidade (BI)</option>
            <option value="PASSAPORTE">Passaporte</option>
            <option value="CARTAO_SAUDE">Cartão de Saúde / Vacinação</option>
            <option value="OUTRO">Outro Comprovativo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Número do Documento (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: 110100482910M"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-sky-500 bg-sky-50/70'
            : selectedFile
            ? 'border-sky-400 bg-sky-50/30'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between bg-white border border-sky-200 rounded-lg p-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-800 truncate max-w-[200px] sm:max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-gray-500">{selectedFile.size}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-500 mb-2">
              <Upload className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">
              <span className="text-sky-600 font-bold">Clique para carregar</span> ou arraste o ficheiro
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Tamanho máx.: 10MB (PDF, JPG, PNG)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleAddDocument}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Confirmar e Anexar Documento
          </button>
        </div>
      )}
    </div>
  );
};
