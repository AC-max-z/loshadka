import { Command } from 'commander';
import { ConfigReader } from './src/util/config-reader';
import { ClickHouseLoader } from './src/loaders/clickhouse-load';
import { LoadProfile, LoadProfileType } from './src/types/test-config';
import * as winston from 'winston';
import { Reporter } from './src/util/reporter';
import { dirname } from 'path';
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

// 0.read args
const startTime = new Date();
const options = program.opts();
// 1.get correct test config by supplied args
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

logger.info('Got config!\n', testConfig.toString());

const envConfig = configReader.getEnvConfig();
const loadProfiles = configReader.getLoadProfiles();
// 2.based on load profiles specified in config - launch correct script for each

logger.info(
    `So...what do we have here? Looks like there are ${loadProfiles.length} profiles specified. Here they are:`
);
logger.info(loadProfiles);

async function runProfiles() {
    for await (const profile of loadProfiles) {
        const loader: ClickHouseLoader = _initclickhouseLoader(profile);

        logger.info('Starting profile:\n', profile.toString());

        switch (profile.type) {
            case LoadProfileType.Insert:
                logger.info(
                    'Ok looks like we have INSERT profile here...Let`s stuff this database with our DATA!!!'
                );
                try {
                    await loader.loadInserts();
                } catch (error) {
                    logger.log(error);
                }
                break;
            case LoadProfileType.Select:
                logger.info(
                    'Hmmm...this one is SELECT profile here. Okay, let`s fetch you some stuff...'
                );

                try {
                    await loader.loadSelects();
                    logger.info(`Done executing profile\n ${profile.type}`);
                } catch (error) {
                    console.log(error);
                }
                break;
            default:
                logger.error(
                    'Oops! Looks like there is no implementation for this profile (yet?):('
                );
                logger.warn(
                    'Please make sure you`ve specified the profile type correctly in supplied config...'
                );
                logger.warn(
                    'If you are like 100% sure that it is supposed to work\n' +
                        'or wish this stuff to be added, please open an issue in repo where you found me!'
                );
                // TODO: implement me
                break;
        }
    }
}

function _initclickhouseLoader(profile: LoadProfile): ClickHouseLoader {
    return new ClickHouseLoader(profile, envConfig, logger, reporter);
}
// 3.???

runProfiles().then(() => {
    logger.info('YAY! Finished your work!');
    logger.info(
        'Hope that I did good and you are satisfied with results. CYA!'
    );

    const endDate = new Date();
    reporter.setEnd(endDate);
    reporter.publish();
    process.exit(0);
});
// 4.PROFIT
