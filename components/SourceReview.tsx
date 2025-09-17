import React from 'react';
import { DiscoveryResult, GroundingSource } from '../types';
import { ZapIcon, SearchIcon, RefreshIcon, LinkIcon, WikipediaIcon, MicIcon } from './icons';

interface SourceReviewProps {
    result: DiscoveryResult;
    onProceed: () => void;
    onCancel: () => void;
}

const SourceIcon: React.FC<{ uri: string }> = ({ uri }) => {
    try {
        const hostname = new URL(uri).hostname.toLowerCase();
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return <MicIcon className="w-6 h-6 text-red-400" />;
        if (hostname.includes('wikipedia.org')) return <WikipediaIcon className="w-6 h-6 text-gray-300" />;
    } catch (e) {
        // Invalid URL, fallback
    }
    return <LinkIcon className="w-6 h-6 text-gray-400" />;
}


const SourceReview: React.FC<SourceReviewProps> = ({ result, onProceed, onCancel }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 md:p-8 shadow-2xl shadow-cyan-500/5 animate-fade-in">
            <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold font-display text-cyan-400 flex items-center gap-2">
                    <SearchIcon className="w-6 h-6" />
                    FASE 1: Revisão da Pesquisa Fundamentada
                </h2>
                <p className="text-sm text-gray-400 mt-2">A IA realizou uma pesquisa em tempo real. Revise o resumo e as fontes consultadas. Este material será a ÚNICA base para a extração das 8 camadas cognitivas.</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-300">Resumo da Pesquisa</h3>
                    <div className="mt-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{result.summaryText}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-300">Fontes Consultadas</h3>
                    <div className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                        {result.groundedSources.map((source, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex-shrink-0">
                                    <SourceIcon uri={source.uri} />
                                </div>
                                <div className="overflow-hidden">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:underline truncate block" title={source.uri}>
                                        {source.title}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                 <button onClick={onCancel} className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-2 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-colors">
                    <RefreshIcon className="w-5 h-5"/>
                    Cancelar e Reiniciar
                </button>
                 <button onClick={onProceed} className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105">
                    <ZapIcon className="w-5 h-5"/>
                    Aprovar Pesquisa e Iniciar Extração
                </button>
            </div>
        </div>
    );
};

export default SourceReview;
