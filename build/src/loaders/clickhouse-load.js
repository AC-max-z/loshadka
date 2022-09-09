"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseLoader = void 0;
const car_positions_generator_js_1 = require("../util/generators/car-positions-generator.js");
const ch_client_js_1 = require("../clients/ch-client.js");
const uuid_js_1 = require("../types/uuid.js");
class ClickHouseLoader {
    // 0. Entrypoint (recieves env config data, load profile data)
    constructor(profile, env, logger, reporter) {
        this.profile = profile;
        this.environment = env;
        this.logger = logger;
        this.clickhouseClient = new ch_client_js_1.ClickHouseClient(this.environment, this.logger);
        this.reporter = reporter;
    }
    // 1. For each scenario from load profile run desired script
    /**
     * Loads clickhouse with INSERT queries
     *
     * @returns {Promise}
     */
    loadInserts() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Start executing INSERT profile');
            const payloads = [];
            const batchSize = this.profile.chunkSize;
            const totalAmt = this.profile.amount;
            const iterations = this.profile.iterations || 1;
            this.logger.info(`Batch size is ${batchSize}`);
            this.logger.info(`Total amount of queries to be performed is ${totalAmt}`);
            let arrayOfBatches;
            switch (this.profile.payload.type) {
                case 'carPositions':
                    //   1.1. Generate test payload
                    this.logger.info('Trying to generate car positions payloads...');
                    payloads.push(...car_positions_generator_js_1.CarPositionGenerator.generateListOfPositions(totalAmt));
                    this.logger.info(`Payloads generated successfully, total amount: ${payloads.length}`);
                    arrayOfBatches = this._splitPayloadsIntoBatches(payloads, batchSize);
                    // eslint-disable-next-line no-case-declarations
                    // TODO: it fails somewhy on my local cluster (though initially cluster tables were created)
                    // TODO: Investigate/fix
                    // const createResponse =
                    //     await this.clickhouseClient.createTableIfNotExists(
                    //         this.profile.db,
                    //         this.profile.table
                    //     );
                    //this.logger.info(createResponse);
                    for (let iteration = 0; iteration < iterations; iteration++) {
                        try {
                            this.logger.info(`Executing iteration ${iteration} of ${iterations}`);
                            this.logger.info(`Profile type: ${this.profile.type}`);
                            yield this._sendInsertRequests(arrayOfBatches);
                            this.logger.info(`All queries executed for iteration ${iteration} of ${iterations}!`);
                        }
                        catch (error) {
                            this.logger.error('Some eror occured when executing insert queries!');
                            this.logger.error(error);
                        }
                    }
                    break;
                default:
                    // TODO: implement me
                    throw new Error('Not implemented!');
            }
        });
    }
    /**
     * Inserts supplied batches of payloads into clickhouse
     * @private
     *
     * @param {Array<Object>} payloads
     * @returns {Promise}
     */
    _sendInsertRequests(payloads) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const batch of payloads) {
                const requestId = new uuid_js_1.UUID();
                const startTime = new Date();
                let endTime;
                let result;
                try {
                    // TODO: redo with better async here
                    yield this.clickhouseClient.insert(this.profile.db, this.profile.table, batch);
                    endTime = new Date();
                    result = 'Success';
                    this.logger.info(`Request ${requestId} ended up with success!`);
                    this.reporter.reportQueryResult(result, requestId, startTime, endTime);
                }
                catch (error) {
                    endTime = new Date();
                    result = `Error: ${error}`;
                    this.logger.error(`Request ${requestId} ended up with error!`, error);
                    this.reporter.reportQueryResult(result, requestId, startTime, endTime);
                }
            }
        });
    }
    /**
     * Loads clickhouse with SELECT queries
     */
    loadSelects() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: implement me
            const iterations = this.profile.iterations || 1;
            for (let iteration = 0; iteration < iterations; iteration++) {
                try {
                    this.logger.info(`Executing iteration ${iteration} of ${iterations}`);
                    this.logger.info(`Profile type: ${this.profile.type}`);
                    yield this._sendSelectAllQueries();
                    this.logger.info(`All queries executed for iteration ${iteration} of ${iterations}!`);
                }
                catch (error) {
                    this.logger.error('Some eror occured when executing insert queries!');
                    this.logger.error(error);
                }
            }
        });
    }
    _sendSelectAllQueries() {
        return __awaiter(this, void 0, void 0, function* () {
            const requestId = new uuid_js_1.UUID();
            const startTime = new Date();
            let endTime;
            let result;
            try {
                // TODO: redo with better async here
                yield this.clickhouseClient.selectAll(this.profile.table, this.profile.chunkSize);
                endTime = new Date();
                result = 'Success';
                this.logger.info(`Request ${requestId} ended up with success!`);
                this.reporter.reportQueryResult(result, requestId, startTime, endTime);
            }
            catch (error) {
                endTime = new Date();
                result = `Error: ${error}`;
                this.logger.error(`Request ${requestId} ended up with error!`, error);
                this.reporter.reportQueryResult(result, requestId, startTime, endTime);
            }
        });
    }
    /**
     * Splits payloads array into array of batches of payloads
     * @private
     *
     * @param {Array<unknown> | Array<CarPosition>} payloads
     * @param {number} batchSize
     * @returns {Array<Array<unknown>>}
     */
    _splitPayloadsIntoBatches(payloads, batchSize) {
        this.logger.info(`Splitting payloads into batches of size ${batchSize}...`);
        const arrOfPayloads = payloads;
        const arrayOfBatches = [];
        while (arrOfPayloads.length > 0) {
            // slice of payloads with the size of batch
            // starting from 0 index
            const batch = arrOfPayloads.slice(0, batchSize);
            arrOfPayloads.splice(0, batchSize);
            arrayOfBatches.push(batch);
            batchSize =
                arrOfPayloads.length >= batchSize
                    ? batchSize
                    : arrOfPayloads.length;
            // and in the end we supposedly
            // have an array of batches of payloads
        }
        this.logger.info(`Payloads splitted successfully! Batch size: ${arrayOfBatches[0].length}`);
        this.logger.info(`Total batches: ${arrayOfBatches.length}`);
        return arrayOfBatches;
    }
}
exports.ClickHouseLoader = ClickHouseLoader;
// 2. ???
// 3. PROFIT!
//# sourceMappingURL=clickhouse-load.js.map