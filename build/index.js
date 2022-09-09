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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_reader_1 = require("./src/util/config-reader");
const clickhouse_load_1 = require("./src/loaders/clickhouse-load");
const test_config_1 = require("./src/types/test-config");
const winston = require("winston");
const reporter_1 = require("./src/util/reporter");
const path_1 = require("path");
const rootPath = (0, path_1.dirname)(require.main.filename);
const program = new commander_1.Command();
program
    .version('0.1')
    .description('Load test scripts for clickhouse and stuff')
    .option('-c, --config <string>', 'path to test config', './configs/default.json')
    .parse();
// 0.read args
const startTime = new Date();
const options = program.opts();
// 1.get correct test config by supplied args
const logConfig = {
    format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.splat(), winston.format.label({
        label: '🤡',
    }), winston.format.printf(({ timestamp, level, message, service, label }) => {
        return `[${timestamp}] ${service} ${level}: ${label} ${JSON.stringify(message, null, 4)}`;
    })),
    defaultMeta: { service: 'loshadka' },
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({
            level: 'error',
            filename: `${rootPath}/log/error.log`,
        }),
        new winston.transports.File({
            filename: `${rootPath}/log/combined.log`,
        }),
    ],
};
const logger = winston.createLogger(logConfig);
const reporter = new reporter_1.Reporter(logger);
reporter.setStart(startTime);
logger.info('Let`s go!');
logger.info(`Attempting to read config from ${options.config.toString()}! Let's see...`);
const configReader = new config_reader_1.ConfigReader(options.config, logger);
const testConfig = configReader.getTestConfig();
logger.info('Got config!\n', testConfig.toString());
const envConfig = configReader.getEnvConfig();
const loadProfiles = configReader.getLoadProfiles();
// 2.based on load profiles specified in config - launch correct script for each
logger.info(`So...what do we have here? Looks like there are ${loadProfiles.length} profiles specified. Here they are:`);
logger.info(loadProfiles);
function runProfiles() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (var loadProfiles_1 = __asyncValues(loadProfiles), loadProfiles_1_1; loadProfiles_1_1 = yield loadProfiles_1.next(), !loadProfiles_1_1.done;) {
                const profile = loadProfiles_1_1.value;
                const loader = _initclickhouseLoader(profile);
                logger.info('Starting profile:\n', profile.toString());
                switch (profile.type) {
                    case test_config_1.LoadProfileType.Insert:
                        logger.info('Ok looks like we have INSERT profile here...Let`s stuff this database with our DATA!!!');
                        try {
                            yield loader.loadInserts();
                        }
                        catch (error) {
                            logger.log(error);
                        }
                        break;
                    case test_config_1.LoadProfileType.Select:
                        logger.info('Hmmm...this one is SELECT profile here. Okay, let`s fetch you some stuff...');
                        try {
                            yield loader.loadSelects();
                            logger.info(`Done executing profile\n ${profile.type}`);
                        }
                        catch (error) {
                            console.log(error);
                        }
                        break;
                    default:
                        logger.error('Oops! Looks like there is no implementation for this profile (yet?):(');
                        logger.warn('Please make sure you`ve specified the profile type correctly in supplied config...');
                        logger.warn('If you are like 100% sure that it is supposed to work\n' +
                            'or wish this stuff to be added, please open an issue in repo where you found me!');
                        // TODO: implement me
                        break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (loadProfiles_1_1 && !loadProfiles_1_1.done && (_a = loadProfiles_1.return)) yield _a.call(loadProfiles_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
function _initclickhouseLoader(profile) {
    return new clickhouse_load_1.ClickHouseLoader(profile, envConfig, logger, reporter);
}
// 3.???
runProfiles().then(() => {
    logger.info('YAY! Finished your work!');
    logger.info('Hope that I did good and you are satisfied with results. CYA!');
    const endDate = new Date();
    reporter.setEnd(endDate);
    reporter.publish();
    process.exit(0);
});
// 4.PROFIT
//# sourceMappingURL=index.js.map