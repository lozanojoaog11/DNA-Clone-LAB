import React, { useState, useCallback } from 'react';
import { DNACloneResult, KnowledgeBaseFile, GroundingSource } from '../types';
import { CopyIcon, FolderIcon, FileIcon, CheckIcon, RefreshIcon, ChevronDownIcon, ChevronRightIcon, DownloadIcon, BookOpenIcon, LinkIcon, MicIcon, FileTextIcon, SearchIcon, WikipediaIcon } from './icons';

// --- Helper Functions ---
const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const SourceIcon: React.FC<{ uri: string }> = ({ uri }) => {
    try {
        const hostname = new URL(uri).hostname.toLowerCase();
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <MicIcon className="w-5 h-5 text-red-400" />;
        if (hostname.includes('wikipedia.org')) return <WikipediaIcon className="w-5 h-5 text-gray-300" />;
        if (hostname.includes('medium.com') || hostname.includes('substack.com')) return <FileTextIcon className="w-5 h-5 text-green-400" />;
    } catch (e) {
        // Invalid URL, fallback
    }
    return <LinkIcon className="w-5 h-5 text-gray-400" />;
}

// --- KnowledgeBaseTree Component ---
interface KnowledgeBaseTreeProps {
    files: KnowledgeBaseFile[];
    onFileSelect: (file: KnowledgeBaseFile) => void;
    selectedFile: KnowledgeBaseFile | null;
}

const KnowledgeBaseTree: React.FC<KnowledgeBaseTreeProps> = ({ files, onFileSelect, selectedFile }) => {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(
        Object.fromEntries(files.map(f => [f.name, true]))
    );

    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
    };

    const renderFile = (file: KnowledgeBaseFile, depth: number) => (
        <li key={file.name}>
            <button onClick={() => onFileSelect(file)} className={`flex items-center gap-2 w-full text-left p-1 rounded-md transition-colors ${selectedFile?.name === file.name ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`} style={{ paddingLeft: `${depth * 1.5}rem`}}>
                <FileIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-xs text-gray-300 truncate">{file.name}</span>
            </button>
        </li>
    );

    const renderFolder = (folder: KnowledgeBaseFile, depth: number) => (
        <li key={folder.name}>
            <div className="flex items-center gap-2 cursor-pointer p-1" onClick={() => toggleFolder(folder.name)} style={{ paddingLeft: `${depth * 1.5}rem`}}>
                {expandedFolders[folder.name] ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />}
                <FolderIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="font-mono text-sm">{folder.name}</span>
            </div>
            {expandedFolders[folder.name] && folder.children && (
                <ul className="mt-1 space-y-1">
                    {folder.children.map((child) => child.children ? renderFolder(child, depth + 1) : renderFile(child, depth + 1))}
                </ul>
            )}
        </li>
    );

    return <ul className="space-y-1">{files.map(file => file.children ? renderFolder(file, 0) : renderFile(file, 0))}</ul>;
};


// --- ResultDisplay Component ---
const ResultDisplay: React.FC<{ result: DNACloneResult; onReset: () => void; }> = ({ result, onReset }) => {
    const [promptCopied, setPromptCopied] = useState(false);
    const [contentCopied, setContentCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<KnowledgeBaseFile | null>(result.knowledgeBase[0]?.children?.[0] ?? null);

    const handleCopy = useCallback((text: string, type: 'prompt' | 'content') => {
        navigator.clipboard.writeText(text);
        if (type === 'prompt') {
            setPromptCopied(true);
            setTimeout(() => setPromptCopied(false), 2000);
        } else {
            setContentCopied(true);
            setTimeout(() => setContentCopied(false), 2000);
        }
    }, []);
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 shadow-xl shadow-cyan-500/5">
                    <h3 className="text-lg font-bold font-display text-cyan-400">System Prompt</h3>
                    <div className="relative mt-2">
                        <pre className="bg-gray-900/70 rounded-md p-4 text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto h-48 font-mono">
                            <code>{result.systemPrompt}</code>
                        </pre>
                        <button onClick={() => handleCopy(result.systemPrompt, 'prompt')} className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            {promptCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="text-center bg-gray-800/50 backdrop-blur-sm border border-green-400/20 rounded-lg p-6 shadow-2xl shadow-green-500/5 flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold font-display text-green-400">Clone Aprovado</h2>
                    <p className="text-5xl font-bold font-display text-white mt-1">{result.validationReport.overallScore}%</p>
                    <p className="text-sm text-gray-400">Fidelidade Estimada</p>
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 shadow-xl shadow-cyan-500/5">
                <h3 className="text-lg font-bold font-display text-cyan-400">Knowledge Base</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
                    <div className="md:col-span-1 bg-gray-900/70 rounded-md p-2 overflow-y-auto">
                        <KnowledgeBaseTree files={result.knowledgeBase} onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                    </div>
                    <div className="md:col-span-2 bg-gray-900/70 rounded-md relative overflow-hidden">
                        {selectedFile?.content ? (
                            <>
                                <div className="p-4 overflow-y-auto h-full">
                                    <h4 className="font-bold font-mono text-cyan-300">{selectedFile.name}</h4>
                                    <article className="prose prose-sm prose-invert mt-2 text-gray-300 whitespace-pre-wrap">
                                        {selectedFile.content}
                                    </article>
                                </div>
                                <button onClick={() => handleCopy(selectedFile.content || '', 'content')} className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                                    {contentCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Selecione um arquivo para ver o conteúdo.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
                <h3 className="text-lg font-bold font-display text-gray-300 flex items-center gap-2"><SearchIcon className="w-5 h-5"/>Base de Conhecimento da Clonagem</h3>
                <p className="text-sm text-gray-400 mt-1">Esta clonagem foi baseada na extração das 8 camadas a partir do seguinte resumo, gerado por pesquisa em tempo real:</p>
                
                <div className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold text-cyan-300">Resumo da Pesquisa</h4>
                    <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap font-mono">{result.discoveryResult.summaryText}</p>
                </div>
                
                <div className="mt-4">
                    <h4 className="font-semibold text-purple-300">Fontes Consultadas</h4>
                    <div className="mt-2 space-y-2">
                        {result.discoveryResult.groundedSources.map((source, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                                <SourceIcon uri={source.uri} />
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate" title={source.uri}>
                                    {source.title}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="text-center flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
                 <button onClick={onReset} className="inline-flex items-center gap-2 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-colors">
                    <RefreshIcon className="w-5 h-5"/>
                    Clonar Outra Pessoa
                </button>
                 <button onClick={() => downloadFile(result.systemPrompt, 'system_prompt.md', 'text/markdown')} className="inline-flex items-center gap-2 py-2 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-colors">
                    <DownloadIcon className="w-5 h-5"/>
                    Download System Prompt
                </button>
                 <button onClick={() => downloadFile(JSON.stringify(result, null, 2), 'full_clone_report.json', 'application/json')} className="inline-flex items-center gap-2 py-2 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-colors">
                    <DownloadIcon className="w-5 h-5"/>
                    Download Relatório Completo
                </button>
            </div>
        </div>
    );
};

export default ResultDisplay;
