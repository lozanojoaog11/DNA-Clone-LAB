
import React, { useState, useCallback } from 'react';
import { ProcessingMode } from '../types';
import { UploadIcon, ZapIcon } from './icons';

interface InputFormProps {
    onStart: (name: string, files: File[], mode: ProcessingMode) => void;
    isLoading: boolean;
    error: string | null;
}

const InputForm: React.FC<InputFormProps> = ({ onStart, isLoading, error }) => {
    const [name, setName] = useState<string>('');
    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<ProcessingMode>('Complete');
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart(name, files, mode);
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 md:p-8 shadow-2xl shadow-cyan-500/5 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-xl font-bold font-display text-cyan-400">Entrada do Sistema</h2>
            <p className="text-sm text-gray-400 mt-1">Forneça os dados para iniciar o processo de clonagem.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="person-name" className="block text-sm font-medium text-gray-300">
                        Nome da Pessoa
                    </label>
                    <input
                        id="person-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Naval Ravikant"
                        required
                        className="mt-1 block w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>

                <div>
                    <span className="block text-sm font-medium text-gray-300">Nível de Profundidade</span>
                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-gray-900/50 p-1 border border-gray-600">
                        {(['Quick', 'Complete', 'Deep'] as ProcessingMode[]).map((m) => (
                             <button type="button" key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === m ? 'bg-cyan-500 text-black' : 'text-gray-300 hover:bg-gray-700'}`}>
                                {m}
                             </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Materiais Extras (Opcional)
                    </label>
                    <label
                        htmlFor="file-upload"
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors duration-200 ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                    >
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-500">
                                <p className="pl-1">Arraste e solte arquivos aqui, ou</p>
                                <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none ml-1">
                                    <span>clique para selecionar</span>
                                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">PDFs, livros, áudios, etc.</p>
                        </div>
                    </label>
                    {files.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                            <p>{files.length} arquivo(s) selecionado(s):</p>
                            <ul className="list-disc list-inside">
                                {files.map(f => <li key={f.name} className="truncate">{f.name}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                            Processando...
                        </>
                    ) : (
                        <>
                            <ZapIcon className="w-5 h-5" />
                            Iniciar Clonagem
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default InputForm;
