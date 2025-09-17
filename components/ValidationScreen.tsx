
import React from 'react';
import { ValidationReport } from '../types';
import { ShieldCheckIcon, ZapIcon } from './icons';

interface ValidationScreenProps {
    report: ValidationReport;
    onComplete: () => void;
}

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
};

const ValidationScreen: React.FC<ValidationScreenProps> = ({ report, onComplete }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 md:p-8 shadow-2xl shadow-cyan-500/5 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold font-display text-cyan-400">FASE 4: VALIDAÇÃO DE PROFUNDIDADE</h2>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-lg font-bold ${report.status === 'PASSED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    <ShieldCheckIcon className="w-6 h-6"/>
                    <span>Status: {report.status}</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 text-center bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="font-display text-lg text-gray-300">Fidelidade Geral</h3>
                     <p className="text-6xl font-bold font-display text-white mt-2">{report.overallScore}%</p>
                     <p className="text-sm text-gray-400 mt-4">{report.summary}</p>
                </div>
                <div className="md:col-span-2">
                     <h3 className="font-display text-lg text-gray-300 mb-2">Análise por Camada</h3>
                     <div className="space-y-2">
                        {report.layerResults.sort((a,b) => a.layerId - b.layerId).map(layer => (
                            <div key={layer.layerId} className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm text-gray-200">{layer.layerName}</span>
                                    <span className={`font-bold text-lg ${getScoreColor(layer.score)}`}>{layer.score}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                    <div className={`h-1.5 rounded-full ${getScoreColor(layer.score).replace('text-', 'bg-')}`} style={{width: `${layer.score}%`}}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic">"{layer.summary}"</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                 <button onClick={onComplete} className="w-full md:w-auto flex justify-center items-center gap-2 py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105">
                    <ZapIcon className="w-5 h-5"/>
                    Ver Clone e Knowledge Base
                </button>
            </div>
        </div>
    );
};

export default ValidationScreen;
