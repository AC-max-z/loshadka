"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigReader = void 0;
const fs = require("fs");
/**
 * CONFIG READER!!!!
 * READS THE CONFIGS!!!!!!!
 */
class ConfigReader {
    constructor(configPath, logger) {
        this.logger = logger;
        this.testConfig = this._getTestConfig(configPath);
        this.loadProfiles = this._getLoadProfiles(configPath);
        this.environmentConfig = this._getEnvConfig(configPath);
    }
    getTestConfig() {
        return this.testConfig;
    }
    getLoadProfiles() {
        return this.loadProfiles;
    }
    getEnvConfig() {
        return this.environmentConfig;
    }
    /**
     * Returns environment config from test config at specified path
     *
     * @param {Path} configPath
     * @returns {Environment}
     */
    _getEnvConfig(configPath) {
        return this._getTestConfig(configPath).environment;
    }
    /**
     * Returns list of load profiles from test config at specified path
     *
     * @param {Path} configPath
     * @returns {Array<LoadProfile>}
     */
    _getLoadProfiles(configPath) {
        return this._getTestConfig(configPath).loadProfiles;
    }
    /**
     * Returns test config at specified path...
     *
     * @param {Path} path
     * @returns {TestConfig}
     */
    _getTestConfig(path) {
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
    _readConfigFile(configPath) {
        let configFileText;
        let parsed;
        try {
            configFileText = fs.readFileSync(configPath).toString();
            this.logger.info('Attempting to parse config content:\n', configFileText);
            parsed = JSON.parse(configFileText);
            this.logger.info('Parsed successfully! Yay!');
            return parsed;
        }
        catch (error) {
            this.logger.error(`I'm very sorry! Couldn't parse config file at ${configPath} :(`);
            process.exit(1);
        }
    }
}
exports.ConfigReader = ConfigReader;
//# sourceMappingURL=config-reader.js.map