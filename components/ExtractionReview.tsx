import React, { useState } from 'react';
import { FullExtractionResult } from '../types';
import { ZapIcon, FlaskConicalIcon, RefreshIcon, ChevronDownIcon, ChevronRightIcon } from './icons';

interface ExtractionReviewProps {
    result: FullExtractionResult;
    onProceed: () => void;
    onCancel: () => void;
}

const ExtractionReview: React.FC<ExtractionReviewProps> = ({ result, onProceed, onCancel }) => {
    const [expandedLayers, setExpandedLayers] = useState<Record<number, boolean>>(
        Object.fromEntries(result.layers.map(l => [l.layerId, true]))
    );

    const toggleLayer = (layerId: number) => {
        setExpandedLayers(prev => ({...prev, [layerId]: !prev[layerId]}));
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 md:p-8 shadow-2xl shadow-cyan-500/5 animate-fade-in">
            <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold font-display text-cyan-400 flex items-center gap-2">
                    <FlaskConicalIcon className="w-6 h-6" />
                    FASE 2: Revisão da Extração Bruta
                </h2>
                <p className="text-sm text-gray-400 mt-2">Abaixo estão os dados brutos extraídos das fontes para cada uma das 8 camadas cognitivas. Revise os insights antes de prosseguir para a síntese final.</p>
            </div>
            
            <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {result.layers.sort((a, b) => a.layerId - b.layerId).map(layer => (
                    <div key={layer.layerId} className="bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleLayer(layer.layerId)}>
                            <h3 className="font-bold text-gray-200">{layer.layerName}</h3>
                            {expandedLayers[layer.layerId] ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                        {expandedLayers[layer.layerId] && (
                            <div className="p-4 border-t border-gray-700">
                                <p className="text-sm italic text-gray-400">"{layer.summary}"</p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-sm text-cyan-300">Insights Chave</h4>
                                        <ul className="mt-1 list-disc list-inside text-sm text-gray-300 space-y-1">
                                            {layer.keyInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-purple-300">Evidências e Citações</h4>
                                         <ul className="mt-1 list-disc list-inside text-sm text-gray-300 space-y-1">
                                            {layer.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
                 <button onClick={onCancel} className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-2 px-6 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-colors">
                    <RefreshIcon className="w-5 h-5"/>
                    Cancelar e Reiniciar
                </button>
                 <button onClick={onProceed} className="w-full md:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105">
                    <ZapIcon className="w-5 h-5"/>
                    Aprovar Extração e Iniciar Síntese
                </button>
            </div>
        </div>
    );
};

export default ExtractionReview;
