export interface GeminiAnalysis {
    sentiment: number;
    productivity: number;
    summary: string;
    parsedResponse: {
        yesterday: string;
        today: string;
        blockers: string;
    };
    metrics: {
        taskCompletion: number;
        blockersResolved: boolean;
        responseTime: number;
        detailLevel: number;
    };
}
