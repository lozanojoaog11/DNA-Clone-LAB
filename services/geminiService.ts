import { GoogleGenAI, Type } from "@google/genai";
import { ProcessingMode, GeneratedClone, ValidationReport, FullExtractionResult, DiscoveryResult, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- PHASE 1: DISCOVERY (using real Google Search) ---

export const runDiscoveryPhase = async (personName: string, files: File[], mode: ProcessingMode): Promise<DiscoveryResult> => {
    const systemInstruction = `Você é o "Discovery Engine" do "SISTEMA DE CLONAGEM MENTAL DNA™". Sua tarefa é realizar uma PESQUISA FUNDAMENTADA (Grounded Research) usando a ferramenta Google Search. Você DEVE pesquisar o indivíduo para criar um resumo biográfico e de suas principais ideias. Sua resposta DEVE ser apenas o texto do resumo. As fontes que você usar serão extraídas dos metadados.`;
    
    let fileInfo = "Nenhum material extra fornecido.";
    if (files.length > 0) {
        fileInfo = `Considere também os seguintes materiais extras fornecidos: ${files.map(f => f.name).join(', ')}.`;
    }

    const prompt = `Realize uma pesquisa aprofundada sobre "${personName}". Foco do modo de análise: ${mode}. ${fileInfo} Sintetize a pesquisa em um resumo detalhado (3-5 parágrafos) que servirá de base para a extração das 8 camadas cognitivas.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, tools: [{googleSearch: {}}] },
        });

        const summaryText = response.text;
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const groundedSources: GroundingSource[] = rawChunks
            .map((chunk: any) => ({
                title: chunk.web?.title || 'Fonte desconhecida',
                uri: chunk.web?.uri || '',
            }))
            .filter(source => source.uri);

        if (!summaryText || groundedSources.length === 0) {
            throw new Error("A pesquisa não retornou resultados suficientes. Tente ser mais específico ou verifique o nome.");
        }

        return { summaryText, groundedSources };
    } catch (error) {
        console.error("Error in Discovery Phase:", error);
        throw new Error("Falha na fase de pesquisa e descoberta. A IA não conseguiu encontrar informações suficientes.");
    }
};


// --- PHASE 2: EXTRACTION ---

const extractionSchema = {
    type: Type.OBJECT,
    properties: {
        layers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    layerId: { type: Type.INTEGER },
                    layerName: { type: Type.STRING },
                    summary: { type: Type.STRING, description: "Um parágrafo resumindo as descobertas para esta camada." },
                    keyInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 insights chave em formato de bullet points." },
                    evidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 exemplos concretos ou 'citações' inferidas do texto que suportam a análise." }
                }
            }
        }
    }
};

export const runExtractionPhase = async (personName: string, discoveryResult: DiscoveryResult, mode: ProcessingMode): Promise<FullExtractionResult> => {
    const systemInstruction = `Você é o "Extraction Processor" do "SISTEMA DE CLONAGEM MENTAL DNA™". Sua tarefa é a EXTRAÇÃO BRUTA. Você receberá um resumo de texto PRÉ-PESQUISADO e VERIFICADO. Sua missão é preencher um dossiê estruturado, camada por camada, baseando-se EXCLUSIVAMENTE nas informações contidas neste texto. Não invente nada fora do contexto fornecido. Para cada uma das 8 Camadas Cognitivas, você deve extrair um resumo, insights chave e evidências. Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao esquema fornecido, contendo TODAS as 8 camadas.`;

    const prompt = `Extraia as 8 camadas cognitivas para "${personName}" (Modo: ${mode}) baseado EXCLUSIVAMENTE no seguinte resumo de pesquisa:\n\n--- INÍCIO DO RESUMO ---\n${discoveryResult.summaryText}\n--- FIM DO RESUMO ---\n\nPreencha o dossiê de extração completo.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: extractionSchema, temperature: 0.5 },
        });
        return JSON.parse(response.text.trim()) as FullExtractionResult;
    } catch (error) {
        console.error("Error in Extraction Phase:", error);
        throw new Error("Falha na fase de extração das camadas.");
    }
};


// --- PHASE 3: SYNTHESIS (Embody) ---

const synthesisSchema = {
    type: Type.OBJECT,
    properties: {
        systemPrompt: { type: Type.STRING, description: "O prompt de sistema completo, em Português do Brasil, sintetizado a partir do dossiê de extração." },
        knowledgeBase: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    children: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                content: { type: Type.STRING, description: "Conteúdo markdown detalhado (2-4 parágrafos), sintetizado a partir dos dados da camada correspondente no dossiê." }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const runSynthesisPhase = async (personName: string, extraction: FullExtractionResult, mode: ProcessingMode): Promise<GeneratedClone> => {
    const systemInstruction = `Você é o "Synthesis Generator" do "SISTEMA DE CLONAGEM MENTAL DNA™". Sua tarefa é a SÍNTESE (Embody). Você receberá um dossiê de extração bruto e pré-aprovado. Sua única missão é sintetizar essa informação em dois artefatos finais: um System Prompt coeso e uma Knowledge Base detalhada. Não invente novas informações; sua tarefa é refinar e estruturar os dados fornecidos. Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao esquema fornecido.`;

    const prompt = `Sintetize o clone de "${personName}" (Modo: ${mode}) a partir do seguinte dossiê de extração:\n\n${JSON.stringify(extraction, null, 2)}\n\Gere o System Prompt e a Knowledge Base. O conteúdo dos arquivos .md deve ser rico e derivado diretamente do dossiê.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: synthesisSchema, temperature: 0.6 },
        });
        return JSON.parse(response.text.trim()) as GeneratedClone;
    } catch (error) {
        console.error("Error in Synthesis Phase:", error);
        throw new Error("Falha na fase de síntese dos artefatos.");
    }
};


// --- PHASE 4: VALIDATION (Perfect) ---

const validationSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER, description: "Pontuação de fidelidade geral entre 94.0 e 98.0." },
        status: { type: Type.STRING, description: "Status final: 'PASSED' se score >= 94, senão 'NEEDS_REFINEMENT'." },
        summary: { type: Type.STRING, description: "Um resumo conciso da qualidade da síntese, comparando o resultado final com a extração bruta." },
        layerResults: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    layerId: { type: Type.INTEGER },
                    layerName: { type: Type.STRING },
                    score: { type: Type.NUMBER, description: "Fidelity score for this layer (0-100)." },
                    summary: { type: Type.STRING, description: "Brief justification for the score, verificando se a síntese refletiu bem a extração." }
                }
            }
        }
    }
};

export const runValidationPhase = async (personName: string, generatedClone: GeneratedClone, extraction: FullExtractionResult): Promise<ValidationReport> => {
    const systemInstruction = `Você é o "Validation System" do "SISTEMA DE CLONAGEM MENTAL DNA™". Sua tarefa é a VALIDAÇÃO (Perfect). Você deve realizar uma análise crítica e independente, comparando os artefatos finais (System Prompt, KB) com o dossiê de extração bruto original para garantir que a síntese foi fiel e não perdeu nuances. Sua resposta DEVE ser um objeto JSON que corresponda EXATAMENTE ao esquema de relatório de validação.`;
    
    // Create a condensed version of the extraction data to avoid overly large prompts.
    const condensedExtraction = {
        layers: extraction.layers.map(layer => ({
            layerId: layer.layerId,
            layerName: layer.layerName,
            summary: layer.summary,
            keyInsights: layer.keyInsights,
        }))
    };

    const prompt = `Valide a SÍNTESE do clone de "${personName}".\n\n**Dossiê de Extração (Resumido):**\n${JSON.stringify(condensedExtraction, null, 2)}\n\n**Artefatos Sintetizados:**\nSystem Prompt: ${generatedClone.systemPrompt.substring(0, 500)}...\nKnowledge Base Resumo: ${generatedClone.knowledgeBase.map(kb => kb.name).join(', ')}\n\nCompare os artefatos com o dossiê. A síntese foi fiel à extração? Gere o relatório de validação.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: validationSchema, temperature: 0.4 },
        });
        const report = JSON.parse(response.text.trim()) as ValidationReport;
        
        if (!report.layerResults || report.layerResults.length !== 8) {
            throw new Error("O relatório de validação está incompleto.");
        }
        report.overallScore = parseFloat(report.overallScore.toFixed(2));
        return report;
    } catch (error) {
        console.error("Error in Validation Phase:", error);
        throw new Error("Falha na fase de validação do clone.");
    }
};