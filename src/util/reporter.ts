import fs = require('fs');
import winston = require('winston');
import { dirname } from 'path';
import { LoadProfileType } from '../types/test-config';
import prc = require('percentile');
import path = require('path');

type QueryResult = {
    start: Date;
    end: Date;
    result: string;
    queryId: string;
    batchSize?: number;
    type?: LoadProfileType;
    duration?: number;
};

type Percentiles = {
    type: LoadProfileType;
    '0%': number;
    '10%': number;
    '20%': number;
    '30%': number;
    '40%': number;
    '50%': number;
    '60%': number;
    '70%': number;
    '80%': number;
    '90%': number;
    '95%': number;
    '99%': number;
};

export class Reporter {
    logger: winston.Logger;
    startTime: Date;
    finishTime: Date;
    queriesProcessed: number;
    errors: number;
    success: number;
    amountSelects: number;
    amountInserts: number;
    queryResults: QueryResult[];
    executionTime: number;
    avgResponseTime: {
        SELECT: number;
        INSERT: number;
    };

    constructor(logger: winston.Logger) {
        this.logger = logger;
        this.queryResults = [];
        this.queriesProcessed = 0;
        this.errors = 0;
        this.success = 0;
        this.amountInserts = 0;
        this.amountSelects = 0;
        this.avgResponseTime = {
            SELECT: 0,
            INSERT: 0,
        };
    }

    public setStart(start: Date): void {
        this.startTime = start;
    }

    public setEnd(end: Date): void {
        this.finishTime = end;
    }

    public reportQueryResult(
        result: string,
        queryId: string,
        start: Date,
        end: Date,
        type?: LoadProfileType,
        batchSize?: number,
        executionTime?: number
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
            batchSize: batchSize,
            duration: executionTime,
            type: type,
        });
    }

    private _calculateAverage() {
        let totalTimeInserts = 0;
        let totalTimeSelects = 0;
        this.queryResults.forEach(result => {
            if (result.type == LoadProfileType.Insert) {
                totalTimeInserts += result.duration;
                this.amountInserts++;
            } else if (result.type == LoadProfileType.Select) {
                totalTimeSelects += result.duration;
                this.amountSelects++;
            }
        });

        this.avgResponseTime.INSERT = Math.round(
            totalTimeInserts / this.amountInserts
        );
        this.avgResponseTime.SELECT = Math.round(
            totalTimeSelects / this.amountSelects
        );
        const percentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99];
    }

    public publish(): void {
        this._calculateAverage();
        const report = {
            start: this.startTime.toString(),
            end: this.finishTime.toString(),
            executionTime: `${
                this.finishTime.getTime() - this.startTime.getTime()
            }ms`,
            totalProcessed: this.queriesProcessed,
            amountSelects: this.amountSelects,
            amountInserts: this.amountInserts,
            totalSuccess: this.success,
            totalErrors: this.errors,
            avgResponseTime: this.avgResponseTime,
            requests: this.queryResults,
        };
        const rootPath = dirname(require.main.filename);
        fs.writeFileSync(
            path.join(
                `${rootPath}`,
                'log',
                `report-${new Date().getTime()}.json`
            ),
            JSON.stringify(report, null, 2),
            'utf-8'
        );
    }
}
