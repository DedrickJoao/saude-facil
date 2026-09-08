import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  Database,
  Server,
  Layers,
  Terminal,
  Copy,
  Check,
  FileCode,
  Cpu,
  BookOpen
} from 'lucide-react';
import { ARCHITECTURE_TREE, CODE_SCAFFOLDS } from '../data/architectureDocs';

export const ArchitectureExplorer: React.FC = () => {
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentSnippet = CODE_SCAFFOLDS[selectedSnippetIndex];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-3 border border-sky-500/30">
            <Cpu className="w-3.5 h-3.5" /> Arquitetura Full-Stack & Scaffold
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            Estrutura Completa de Código - Saúde Fácil
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Arquitetura escalável para micro-seguro de saúde: Frontend React responsivo (Mobile & Desktop), Backend Node.js/Express modular, Schemas PostgreSQL (Prisma) e MongoDB (Mongoose), integração com API Vodacom M-Pesa C2B e sistema de autorizações farmacêuticas.
          </p>
        </div>
      </div>

      {/* Main Grid: Folder Tree & Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Folder Structure */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-sky-600" />
              Estrutura de Pastas do Projeto
            </h3>
            <button
              onClick={() => handleCopy(ARCHITECTURE_TREE, 999)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Copiar estrutura"
            >
              {copiedIndex === 999 ? <Check className="w-4 h-4 text-sky-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-slate-950 text-slate-200 font-mono text-[11px] p-4 rounded-2xl overflow-x-auto flex-1 leading-relaxed border border-slate-800">
            <pre>{ARCHITECTURE_TREE}</pre>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 space-y-1">
            <p className="font-bold text-gray-800">💡 Dica de Escalabilidade:</p>
            <p>
              A arquitetura separa o domínio de pagamentos (M-Pesa Gateway) dos serviços clínicos e de farmácia, permitindo escalar micro-serviços ou deploys independentes na nuvem.
            </p>
          </div>
        </div>

        {/* Right Column: Code Snippets & Schemas Explorer */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col">
          {/* Snippet Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-gray-100">
            {CODE_SCAFFOLDS.map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSnippetIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSnippetIndex === idx
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {snippet.title.split('.')[1] || snippet.title}
              </button>
            ))}
          </div>

          {/* Current Code Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="text-sm font-extrabold text-gray-900">{currentSnippet.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{currentSnippet.description}</p>
              <span className="inline-block mt-1 font-mono text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                Ficheiro: {currentSnippet.fileName}
              </span>
            </div>

            <button
              onClick={() => handleCopy(currentSnippet.code, selectedSnippetIndex)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {copiedIndex === selectedSnippetIndex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sky-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Código
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Container */}
          <div className="relative bg-slate-950 text-sky-300 font-mono text-xs rounded-2xl p-4 overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed shadow-inner">
            <pre>
              <code>{currentSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide to Run in VS Code */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 shadow-md border border-slate-800">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-sky-400" />
          Como Executar este Scaffold no seu VS Code Local
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-white">Instalar Dependências</h4>
            <p className="text-slate-400">Abra o terminal no VS Code e instale todos os módulos necessários:</p>
            <div className="bg-slate-950 p-2 rounded-lg font-mono text-sky-400">
              npm install
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-white">Configurar .env</h4>
            <p className="text-slate-400">Crie o ficheiro de variáveis a partir do exemplo fornecido:</p>
            <div className="bg-slate-950 p-2 rounded-lg font-mono text-sky-400">
              cp .env.example .env
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-white">Iniciar Servidor Full-Stack</h4>
            <p className="text-slate-400">Execute o comando para iniciar backend Express e frontend Vite:</p>
            <div className="bg-slate-950 p-2 rounded-lg font-mono text-sky-400">
              npm run dev
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
