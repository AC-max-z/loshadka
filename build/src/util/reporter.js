"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
const fs = require("fs");
const path_1 = require("path");
class Reporter {
    constructor(logger) {
        this.logger = logger;
        this.queryResults = [];
        this.queriesProcessed = 0;
        this.errors = 0;
        this.success = 0;
    }
    setStart(start) {
        this.startTime = start;
    }
    setEnd(end) {
        this.finishTime = end;
    }
    reportQueryResult(result, queryId, start, end) {
        this.queriesProcessed++;
        if (result.toLowerCase() === 'success') {
            this.success++;
        }
        else {
            this.errors++;
        }
        this.queryResults.push({
            start: start,
            end: end,
            result: result,
            queryId: queryId,
        });
    }
    publish() {
        const report = {
            start: this.startTime.toString(),
            end: this.finishTime.toString(),
            totalProcessed: this.queriesProcessed,
            totalSuccess: this.success,
            totalErrors: this.errors,
            requests: this.queryResults,
        };
        const rootPath = (0, path_1.dirname)(require.main.filename);
        fs.writeFileSync(`${rootPath}/log/report-${new Date()}.json`, JSON.stringify(report, null, 2), 'utf-8');
    }
}
exports.Reporter = Reporter;
//# sourceMappingURL=reporter.js.map