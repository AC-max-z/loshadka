import fs = require('fs');
import winston = require('winston');
import { UUID } from '../types/uuid';
import { dirname } from 'path';

type queryResult = {
    start: Date;
    end: Date;
    result: string;
    queryId: UUID;
};

export class Reporter {
    logger: winston.Logger;
    startTime: Date;
    finishTime: Date;
    queriesProcessed: number;
    errors: number;
    success: number;
    queryResults: queryResult[];

    constructor(logger: winston.Logger) {
        this.logger = logger;
        this.queryResults = [];
        this.queriesProcessed = 0;
        this.errors = 0;
        this.success = 0;
    }

    public setStart(start: Date): void {
        this.startTime = start;
    }

    public setEnd(end: Date): void {
        this.finishTime = end;
    }

    public reportQueryResult(
        result: string,
        queryId: UUID,
        start: Date,
        end: Date
    ): void {
        this.queriesProcessed++;
        if (result.toLowerCase() === 'success') {
            this.success++;
        } else {
            this.errors++;
        }
        this.queryResults.push({
            start: start,
            end: end,
            result: result,
            queryId: queryId,
        });
    }

    public publish(): void {
        const report = {
            start: this.startTime.toString(),
            end: this.finishTime.toString(),
            totalProcessed: this.queriesProcessed,
            totalSuccess: this.success,
            totalErrors: this.errors,
            requests: this.queryResults,
        };
        const rootPath = dirname(require.main.filename);
        fs.writeFileSync(
            `${rootPath}/log/report-${new Date()}.json`,
            JSON.stringify(report, null, 2),
            'utf-8'
        );
    }
}
