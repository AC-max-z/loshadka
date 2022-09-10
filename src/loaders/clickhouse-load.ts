import { CarPositionGenerator } from '../util/generators/car-positions-generator.js';
import { ClickHouseClient } from '../clients/ch-client.js';
import {
    Environment,
    LoadProfile,
    LoadProfileType,
} from '../types/test-config.js';
import { CarPosition } from '../types/car-position.js';
import winston = require('winston');
import { UUID } from '../types/uuid.js';
import { Reporter } from '../util/reporter.js';

export class ClickHouseLoader {
    profile: LoadProfile;
    environment: Environment;
    clickhouseClient: ClickHouseClient;
    logger: winston.Logger;
    reporter: Reporter;

    constructor(
        profile: LoadProfile,
        env: Environment,
        logger: winston.Logger,
        reporter: Reporter
    ) {
        this.profile = profile;
        this.environment = env;
        this.logger = logger;
        this.clickhouseClient = new ClickHouseClient(
            this.environment,
            this.logger
        );
        this.reporter = reporter;
    }

    /**
     * Loads clickhouse with INSERT queries
     *
     * @returns {Promise}
     */
    public async loadInserts(): Promise<void> {
        this.logger.info('Start executing INSERT profile');

        const payloads = [];
        const batchSize = this.profile.chunkSize;
        const totalAmt = this.profile.amount;
        const iterations = this.profile.iterations || 1;

        this.logger.info(`Batch size is ${batchSize}`);
        this.logger.info(
            `Total amount of queries to be performed is ${totalAmt}`
        );
        let arrayOfBatches: object[][];

        switch (this.profile.payload.type) {
            case 'carPositions':
                //   1.1. Generate test payload
                this.logger.info(
                    'Trying to generate car positions payloads...'
                );

                payloads.push(
                    ...CarPositionGenerator.generateListOfPositions(totalAmt)
                );

                this.logger.info(
                    `Payloads generated successfully, total amount: ${payloads.length}`
                );

                arrayOfBatches = this._splitPayloadsIntoBatches(
                    payloads,
                    batchSize
                );
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
                        this.logger.info(
                            `Executing iteration ${iteration} of ${iterations}`
                        );
                        this.logger.info(`Profile type: ${this.profile.type}`);
                        await this._sendInsertRequests(arrayOfBatches);
                        this.logger.info(
                            `All queries executed for iteration ${iteration} of ${iterations}!`
                        );
                    } catch (error) {
                        this.logger.error(
                            'Some eror occured when executing insert queries!'
                        );
                        this.logger.error(error);
                    }
                }
                break;
            default:
                // TODO: implement me
                throw new Error('Not implemented!');
        }
    }

    /**
     * Inserts supplied batches of payloads into clickhouse
     * @private
     *
     * @param {Array<Array<Object>>} payloads
     * @returns {Promise}
     */
    private async _sendInsertRequests(payloads: object[][]) {
        for (const batch of payloads) {
            const requestId = new UUID();
            const startTime = new Date();
            const batchSize = batch.length;
            const type = LoadProfileType.Insert;
            let endTime;
            let result;
            let duration;
            try {
                // TODO: redo with better async here
                await this.clickhouseClient.insert(
                    this.profile.db,
                    this.profile.table,
                    batch
                );
                endTime = new Date();
                duration = endTime.getTime() - startTime.getTime();
                result = 'Success';

                this.logger.info(`Request ${requestId} ended up with success!`);
                this.reporter.reportQueryResult(
                    result,
                    requestId.toString(),
                    startTime,
                    endTime,
                    type,
                    batchSize,
                    duration
                );
            } catch (error) {
                endTime = new Date();
                duration = endTime.getTime() - startTime.getTime();
                result = `Error: ${error}`;
                this.logger.error(
                    `Request ${requestId} ended up with error!`,
                    error
                );
                this.reporter.reportQueryResult(
                    result,
                    requestId.toString(),
                    startTime,
                    endTime,
                    type,
                    batchSize,
                    duration
                );
            }
        }
    }

    /**
     * Loads clickhouse with SELECT queries
     */
    public async loadSelects() {
        // TODO: implement me
        const iterations = this.profile.iterations || 1;
        for (let iteration = 0; iteration < iterations; iteration++) {
            try {
                this.logger.info(
                    `Executing iteration ${iteration} of ${iterations}`
                );
                this.logger.info(`Profile type: ${this.profile.type}`);
                await this._sendSelectTopQueries();
                this.logger.info(
                    `All queries executed for iteration ${iteration} of ${iterations}!`
                );
            } catch (error) {
                this.logger.error(
                    'Some eror occured when executing insert queries!'
                );
                this.logger.error(error);
            }
        }
    }

    private async _sendSelectTopQueries() {
        const requestId = new UUID();
        const startTime = new Date();
        let endTime;
        let result;
        let duration;
        try {
            // TODO: redo with better async here
            await this.clickhouseClient.selectAllTop(
                this.profile.table,
                this.profile.chunkSize
            );
            endTime = new Date();
            duration = endTime.getTime() - startTime.getTime();
            result = 'Success';
            this.logger.info(`Request ${requestId} ended up with success!`);
            this.reporter.reportQueryResult(
                result,
                requestId.toString(),
                startTime,
                endTime,
                LoadProfileType.Select,
                this.profile.chunkSize,
                duration
            );
        } catch (error) {
            endTime = new Date();
            duration = endTime.getTime() - startTime.getTime();
            result = `Error: ${error}`;
            this.logger.error(
                `Request ${requestId} ended up with error!`,
                error
            );
            this.reporter.reportQueryResult(
                result,
                requestId.toString(),
                startTime,
                endTime,
                LoadProfileType.Select,
                this.profile.chunkSize,
                duration
            );
        }
    }

    /**
     * Splits payloads array into array of batches of payloads
     * @private
     *
     * @param {Array<unknown> | Array<CarPosition>} payloads
     * @param {number} batchSize
     * @returns {Array<Array<unknown>>}
     */
    private _splitPayloadsIntoBatches(
        payloads: object[] | CarPosition[],
        batchSize: number
    ): object[][] {
        this.logger.info(
            `Splitting payloads into batches of size ${batchSize}...`
        );

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

        this.logger.info(
            `Payloads splitted successfully! Batch size: ${arrayOfBatches[0].length}`
        );
        this.logger.info(`Total batches: ${arrayOfBatches.length}`);
        return arrayOfBatches;
    }
}
