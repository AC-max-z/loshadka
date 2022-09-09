import { Environment, LoadProfile, TestConfig } from '../types/test-config';
import * as fs from 'fs';
import { Logger } from 'winston';

type Path = string;

/**
 * CONFIG READER!!!!
 * READS THE CONFIGS!!!!!!!
 */
export class ConfigReader {
    testConfig: TestConfig;
    loadProfiles: LoadProfile[];
    environmentConfig: Environment;
    logger: Logger;

    constructor(configPath: Path, logger: Logger) {
        this.logger = logger;
        this.testConfig = this._getTestConfig(configPath);
        this.loadProfiles = this._getLoadProfiles(configPath);
        this.environmentConfig = this._getEnvConfig(configPath);
    }

    public getTestConfig(): TestConfig {
        return this.testConfig;
    }

    public getLoadProfiles(): LoadProfile[] {
        return this.loadProfiles;
    }

    public getEnvConfig(): Environment {
        return this.environmentConfig;
    }

    /**
     * Returns environment config from test config at specified path
     *
     * @param {Path} configPath
     * @returns {Environment}
     */
    private _getEnvConfig(configPath: Path): Environment {
        return this._getTestConfig(configPath).environment;
    }

    /**
     * Returns list of load profiles from test config at specified path
     *
     * @param {Path} configPath
     * @returns {Array<LoadProfile>}
     */
    private _getLoadProfiles(configPath: Path): LoadProfile[] {
        return this._getTestConfig(configPath).loadProfiles;
    }

    /**
     * Returns test config at specified path...
     *
     * @param {Path} path
     * @returns {TestConfig}
     */
    private _getTestConfig(path: Path): TestConfig {
        if (!this.testConfig) {
            this.testConfig = this._readConfigFile(path);
        }
        return this.testConfig;
    }

    /**
     * Parses test config from .json file at specified path
     *
     * @param {Path} configPath
     * @returns {TestConfig}
     */
    private _readConfigFile(configPath: Path): TestConfig {
        let configFileText: string;
        let parsed: TestConfig;
        try {
            configFileText = fs.readFileSync(configPath).toString();

            this.logger.info(
                'Attempting to parse config content:\n',
                configFileText
            );

            parsed = JSON.parse(configFileText);

            this.logger.info('Parsed successfully! Yay!');

            return parsed;
        } catch (error) {
            this.logger.error(
                `I'm very sorry! Couldn't parse config file at ${configPath} :(`
            );

            process.exit(1);
        }
    }
}
