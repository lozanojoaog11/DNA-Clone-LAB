export enum AppState {
    INPUT,
    SOURCE_MAPPING, // Renamed to DISCOVERY
    SOURCE_REVIEW,
    EXTRACTING,
    EXTRACTION_REVIEW,
    SYNTHESIZING,
    VALIDATING,
    VALIDATION,
    RESULT
}

export enum ProcessingStatus {
    PENDING = 'Pendente',
    PROCESSING = 'Processando',
    COMPLETED = 'Concluído',
    FAILED = 'Falhou'
}

export interface Layer {
    id: number;
    name: string;
    description: string;
}

export interface KnowledgeBaseFile {
    name: string;
    content?: string;
    children?: KnowledgeBaseFile[];
}

export interface LayerValidationResult {
    layerId: number;
    layerName: string;
    score: number;
    summary: string;
}

export interface ValidationReport {
    overallScore: number;
    status: 'PASSED' | 'NEEDS_REFINEMENT' | 'FAILED';
    summary: string;
    layerResults: LayerValidationResult[];
}

export interface GeneratedClone {
    systemPrompt: string;
    knowledgeBase: KnowledgeBaseFile[];
}

// --- New tangible artifacts for a REAL, GROUNDED research process ---

/**
 * Represents a real source returned by Google Search grounding.
 */
export interface GroundingSource {
    title: string;
    uri: string;
}

/**
 * The tangible result of the Discovery Phase, based on real search.
 */
export interface DiscoveryResult {
    summaryText: string;
    groundedSources: GroundingSource[];
}

export interface ExtractionLayerResult {
    layerId: number;
    layerName: string;
    summary: string;
    keyInsights: string[];
    evidence: string[];
}

export interface FullExtractionResult {
    layers: ExtractionLayerResult[];
}

// --- Main result structure ---
export interface DNACloneResult extends GeneratedClone {
    discoveryResult: DiscoveryResult;
    extractionResult: FullExtractionResult;
    validationReport: ValidationReport;
}

export type ProcessingMode = 'Quick' | 'Complete' | 'Deep';
export type SourceType = 'Book' | 'Interview' | 'Article' | 'Podcast' | 'Wikipedia' | 'Other';
export interface SourceURL {
    type: SourceType;
    title: string;
    url: string;
    summary: string;
}
