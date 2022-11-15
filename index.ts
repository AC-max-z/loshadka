import { Command } from 'commander';
import { ConfigReader } from './src/util/config-reader';
import * as winston from 'winston';
import { Reporter } from './src/util/reporter';
import { dirname } from 'path';
import { ProfileManager } from './src/util/profile-manager';
const rootPath = dirname(require.main.filename);

const program = new Command();
program
    .version('0.1')
    .description('Load test scripts for clickhouse and stuff')
    .option(
        '-c, --config <string>',
        'path to test config',
        './configs/default.json'
    )
    .parse();

const startTime = new Date();
const options = program.opts();

const logConfig = {
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.label({
            label: '🤡',
        }),
        winston.format.printf(
            ({ timestamp, level, message, service, label }) => {
                return `[${timestamp}] ${service} ${level}: ${label} ${JSON.stringify(
                    message,
                    null,
                    4
                )}`;
            }
        )
    ),
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

const logger: winston.Logger = winston.createLogger(logConfig);
const reporter = new Reporter(logger);
reporter.setStart(startTime);

logger.info('Let`s go!');
logger.info(
    `Attempting to read config from ${options.config.toString()}! Let's see...`
);

const configReader = new ConfigReader(options.config, logger);
const testConfig = configReader.getTestConfig();

logger.info('Got config!');
logger.info(testConfig);

const envConfig = configReader.getEnvConfig();
const loadProfiles = configReader.getLoadProfiles();

logger.info(
    `So...what do we have here? Looks like there are ${loadProfiles.length} profiles specified. Here they are:`
);
logger.info(loadProfiles);

const profileManager = new ProfileManager(
    loadProfiles,
    logger,
    envConfig,
    reporter
);

profileManager
    .runProfiles()
    .then(() => {
        logger.info('YAY! Finished your work!');
        logger.info(
            'Hope that I did good and you are satisfied with results. CYA!'
        );

        const endDate = new Date();
        reporter.setEnd(endDate);
        reporter.publish();
        process.exit(0);
    })
    .catch((err) => {
        logger.error('Something went wrong!😭');
        logger.error(err);
        process.exit(1);
    });
