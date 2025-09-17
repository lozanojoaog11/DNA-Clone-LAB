import React, { useState, useEffect } from 'react';
import { AppState, ProcessingStatus, Layer } from '../types';
import { CheckCircleIcon, DnaIcon, HourglassIcon, AlertTriangleIcon, SearchIcon, ZapIcon, ShieldCheckIcon, FlaskConicalIcon } from './icons';

const ALL_LAYERS: Layer[] = [
    { id: 1, name: 'Camada 1: Linguística', description: 'Vocabulário, padrões linguísticos.' },
    { id: 2, name: 'Camada 2: Reconhecimento', description: 'Padrões de reconhecimento e resposta.' },
    { id: 3, name: 'Camada 3: Modelos Mentais', description: 'Estruturas de pensamento recorrentes.' },
    { id: 4, name: 'Camada 4: Decisão', description: 'Arquitetura decisória, hierarquia de valores.' },
    { id: 5, name: 'Camada 5: Valores', description: 'O que nunca abre mão, inegociáveis.' },
    { id: 6, name: 'Camada 6: Obsessões', description: 'Drivers subconscientes, paixões.' },
    { id: 7, name: 'Camada 7: Singularidade', description: 'Algoritmo mental único e distintivo.' },
    { id: 8, name: 'Camada 8: Paradoxos', description: 'Tensões que geram genialidade.' },
];

const PhaseIndicator: React.FC<{ phase: AppState }> = ({ phase }) => {
    const getPhaseInfo = () => {
        switch (phase) {
            case AppState.SOURCE_MAPPING:
                return { icon: <SearchIcon className="w-5 h-5"/>, text: 'FASE 1: MAPEANDO FONTES', description: 'Identificando e catalogando materiais de análise...' };
            case AppState.EXTRACTING:
                return { icon: <FlaskConicalIcon className="w-5 h-5"/>, text: 'FASE 2: EXTRAINDO CAMADAS', description: 'Analisando fontes e extraindo as 8 camadas cognitivas...' };
            case AppState.SYNTHESIZING:
                return { icon: <ZapIcon className="w-5 h-5"/>, text: 'FASE 3: SINTETIZANDO CLONE', description: 'Construindo System Prompt e Knowledge Base...' };
            case AppState.VALIDATING:
                return { icon: <ShieldCheckIcon className="w-5 h-5"/>, text: 'FASE 4: VALIDANDO FIDELIDADE', description: 'Realizando análise de qualidade e consistência...' };
            default:
                return { icon: null, text: 'Aguardando...', description: '' };
        }
    };

    const { icon, text, description } = getPhaseInfo();

    return (
        <div className="text-center border-b border-gray-700 pb-4 mb-4">
             <div className="flex items-center justify-center gap-2 text-cyan-400 font-display text-lg">
                {icon}
                <p>{text}</p>
             </div>
             <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
    );
};

const LayerStatusIcon: React.FC<{ status: ProcessingStatus }> = ({ status }) => {
    switch (status) {
        case ProcessingStatus.PENDING:
            return <HourglassIcon className="w-5 h-5 text-gray-500" />;
        case ProcessingStatus.PROCESSING:
            return <div className="w-5 h-5 animate-spin"><DnaIcon className="w-5 h-5 text-cyan-400" /></div>;
        case ProcessingStatus.COMPLETED:
            return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
        case ProcessingStatus.FAILED:
            return <AlertTriangleIcon className="w-5 h-5 text-red-400" />;
    }
};

const ProcessingDashboard: React.FC<{ personName: string; phase: AppState }> = ({ personName, phase }) => {
    const [layerStatuses, setLayerStatuses] = useState<Record<number, ProcessingStatus>>(
        Object.fromEntries(ALL_LAYERS.map(l => [l.id, ProcessingStatus.PENDING]))
    );

    useEffect(() => {
        if (phase !== AppState.EXTRACTING) {
            const finalStatus = phase > AppState.EXTRACTING ? ProcessingStatus.COMPLETED : ProcessingStatus.PENDING;
            setLayerStatuses(Object.fromEntries(ALL_LAYERS.map(l => [l.id, finalStatus])));
            return;
        }

        let cancelled = false;
        const processLayer = (index: number) => {
            if (index >= ALL_LAYERS.length || cancelled) return;
            const layerId = ALL_LAYERS[index].id;
            
            setLayerStatuses(prev => ({ ...prev, [layerId]: ProcessingStatus.PROCESSING }));
            
            const processingTime = 200 + Math.random() * 200;
            setTimeout(() => {
                if (cancelled) return;
                setLayerStatuses(prev => ({ ...prev, [layerId]: ProcessingStatus.COMPLETED }));
                processLayer(index + 1);
            }, processingTime);
        };
        processLayer(0);
        return () => { cancelled = true; }
    }, [phase]);

    const showLayers = phase === AppState.EXTRACTING || phase > AppState.EXTRACTING;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-lg p-6 md:p-8 shadow-2xl shadow-cyan-500/5 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-white text-center">
                Processando Clone: <span className="text-cyan-300">{personName}</span>
            </h2>
            
            <div className="my-6">
                <PhaseIndicator phase={phase} />
            </div>

            {showLayers ? (
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {ALL_LAYERS.map(layer => (
                     <div key={layer.id} className={`p-3 rounded-md flex items-start gap-3 transition-all duration-300 ${layerStatuses[layer.id] !== ProcessingStatus.PENDING ? 'bg-gray-700/50' : 'bg-gray-800/50 opacity-60'}`}>
                         <div className="flex-shrink-0 mt-0.5">
                             <LayerStatusIcon status={layerStatuses[layer.id]} />
                         </div>
                         <div>
                             <h3 className={`font-semibold text-sm ${layerStatuses[layer.id] !== ProcessingStatus.PENDING ? 'text-gray-200' : 'text-gray-500'}`}>{layer.name}</h3>
                             <p className="text-xs text-gray-400">{layer.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
            ) : (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
            )}
        </div>
    );
};

export default ProcessingDashboard;