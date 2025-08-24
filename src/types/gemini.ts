export interface GeminiAnalysis {
    sentiment: number;
    productivity: number;
    summary: string;
    metrics: {
        taskCompletion: number;
        blockersResolved: boolean;
        responseTime: number;
        detailLevel: number;
    };
}