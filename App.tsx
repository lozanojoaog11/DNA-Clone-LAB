import React, { useState, useCallback } from 'react';
import { DNACloneResult, AppState, ProcessingMode, DiscoveryResult, FullExtractionResult } from './types';
import { runDiscoveryPhase, runExtractionPhase, runSynthesisPhase, runValidationPhase } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ProcessingDashboard from './components/ProcessingDashboard';
import SourceReview from './components/SourceReview';
import ExtractionReview from './components/ExtractionReview';
import ValidationScreen from './components/ValidationScreen';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.INPUT);
    const [personName, setPersonName] = useState<string>('');
    const [cloneResult, setCloneResult] = useState<DNACloneResult | null>(null);
    const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
    const [extractionResult, setExtractionResult] = useState<FullExtractionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [currentMode, setCurrentMode] = useState<ProcessingMode>('Complete');

    const handleError = (e: unknown, phase: string) => {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
        setError(`Falha na fase de ${phase}: ${errorMessage}`);
        setAppState(AppState.INPUT);
        setIsProcessing(false);
    };

    const handleStartCloning = useCallback(async (name: string, files: File[], mode: ProcessingMode) => {
        if (!name.trim()) {
            setError('O nome da pessoa é obrigatório.');
            return;
        }
        setError(null);
        setPersonName(name);
        setCurrentMode(mode);
        setIsProcessing(true);
        setCloneResult(null);
        setDiscoveryResult(null);
        setExtractionResult(null);

        try {
            setAppState(AppState.SOURCE_MAPPING);
            const discovery = await runDiscoveryPhase(name, files, mode);
            setDiscoveryResult(discovery);
            setAppState(AppState.SOURCE_REVIEW);
        } catch (e) {
            handleError(e, "Pesquisa e Descoberta");
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleProceedToExtraction = useCallback(async () => {
        if (!personName || !discoveryResult || !currentMode) return;
        setIsProcessing(true);
        try {
            setAppState(AppState.EXTRACTING);
            const extraction = await runExtractionPhase(personName, discoveryResult, currentMode);
            setExtractionResult(extraction);
            setAppState(AppState.EXTRACTION_REVIEW);
        } catch (e) {
            handleError(e, "Extração");
        } finally {
            setIsProcessing(false);
        }
    }, [personName, discoveryResult, currentMode]);

    const handleProceedToSynthesis = useCallback(async () => {
        if (!personName || !discoveryResult || !extractionResult || !currentMode) return;
        setIsProcessing(true);
        try {
            setAppState(AppState.SYNTHESIZING);
            const generatedClone = await runSynthesisPhase(personName, extractionResult, currentMode);
            
            setAppState(AppState.VALIDATING);
            const validationReport = await runValidationPhase(personName, generatedClone, extractionResult);
            
            setCloneResult({ ...generatedClone, validationReport, discoveryResult, extractionResult });
            setAppState(AppState.VALIDATION);
        } catch (e) {
            handleError(e, "Síntese e Validação");
        } finally {
            setIsProcessing(false);
        }
    }, [personName, discoveryResult, extractionResult, currentMode]);

    const handleValidationComplete = useCallback(() => {
        setAppState(AppState.RESULT);
    }, []);

    const handleReset = useCallback(() => {
        setAppState(AppState.INPUT);
        setPersonName('');
        setCloneResult(null);
        setDiscoveryResult(null);
        setExtractionResult(null);
        setError(null);
    }, []);

    const renderContent = () => {
        switch (appState) {
            case AppState.SOURCE_MAPPING:
            case AppState.EXTRACTING:
            case AppState.SYNTHESIZING:
            case AppState.VALIDATING:
                return <ProcessingDashboard personName={personName} phase={appState} />;
            case AppState.SOURCE_REVIEW:
                return discoveryResult ? <SourceReview result={discoveryResult} onProceed={handleProceedToExtraction} onCancel={handleReset} /> : null;
            case AppState.EXTRACTION_REVIEW:
                return extractionResult ? <ExtractionReview result={extractionResult} onProceed={handleProceedToSynthesis} onCancel={handleReset} /> : null;
            case AppState.VALIDATION:
                return cloneResult ? <ValidationScreen report={cloneResult.validationReport} onComplete={handleValidationComplete} /> : null;
            case AppState.RESULT:
                return cloneResult ? <ResultDisplay result={cloneResult} onReset={handleReset} /> : null;
            case AppState.INPUT:
            default:
                return <InputForm onStart={handleStartCloning} isLoading={isProcessing} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 md:p-8 selection:bg-cyan-400/20">
            <div className="w-full max-w-6xl mx-auto">
                <Header />
                <main className="mt-8">
                    {renderContent()}
                </main>
            </div>
            <footer className="w-full max-w-6xl mx-auto text-center text-xs text-gray-500 mt-12 pb-4">
                <p>SISTEMA DE CLONAGEM MENTAL DNA™ - Blueprint Técnico para Automação Cognitiva</p>
                <p>A fidelidade do clone é uma estimativa simulada baseada na análise de IA.</p>
            </footer>
        </div>
    );
};

export default App;
