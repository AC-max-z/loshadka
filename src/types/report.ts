export interface Report {
    start: Date;
    end: Date;
    executionTime: string;
    totalProcessed: number;
    totalSuccess: number;
    totalErrors: number;
    selects: {
        totalAmount: number;
        totalResponseTime: number;
        avgResponseTime: number;
        medianResponseTime: number;
    };
    inserts: {
        totalAmount: number;
        totalResponseTime: number;
        avgResponseTime: number;
        medianResponseTime: number;
    };
    percentiles: [];
    requests: [];
}
