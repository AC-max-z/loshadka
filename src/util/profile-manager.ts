import { Logger } from 'winston';
import { ClickHouseLoader } from '../loaders/clickhouse-load';
import {
    Environment,
    LoadProfile,
    LoadProfileType,
} from '../types/test-config';
import { Reporter } from './reporter';

/**
 * He knows everything about how to deal with different profiles and stuff
 */
export class ProfileManager {
    profiles: LoadProfile[];
    logger: Logger;
    env: Environment;
    reporter: Reporter;

    constructor(
        profiles: LoadProfile[],
        logger: Logger,
        envConfig: Environment,
        reporter: Reporter
    ) {
        this.logger = logger;
        this.profiles = profiles;
        this.env = envConfig;
        this.reporter = reporter;
    }

    public async runProfiles() {
        for await (const profile of this.profiles) {
            try {
                await this._runProfile(profile);
            } catch (error) {
                this.logger.error(`Error during ${profile.type} execution!`);
                this.logger.error(error);
            }
        }
    }

    private async _runProfile(profile: LoadProfile) {
        const loader: ClickHouseLoader = this._initclickhouseLoader(profile);

        this.logger.info('Starting profile:\n', profile.toString());
        switch (profile.type) {
            case LoadProfileType.Insert:
                this.logger.info(
                    'Ok looks like we have INSERT profile here...Let`s stuff this database with our DATA!!!'
                );
                try {
                    await loader.loadInserts();
                } catch (error) {
                    this.logger.log(error);
                }
                break;
            case LoadProfileType.Select:
                this.logger.info(
                    'Hmmm...this one is SELECT profile here. Okay, let`s fetch you some stuff...'
                );

                try {
                    await loader.loadSelects();
                    this.logger.info(
                        `Done executing profile\n ${profile.type}`
                    );
                } catch (error) {
                    console.log(error);
                }
                break;
            default:
                this.logger.error(
                    'Oops! Looks like there is no implementation for this profile (yet?):('
                );
                this.logger.warn(
                    'Please make sure you`ve specified the profile type correctly in supplied config...'
                );
                this.logger.warn(
                    'If you are like 100% sure that it is supposed to work\n' +
                        'or wish this stuff to be added, please open an issue in repo where you found me!'
                );
                throw new Error(
                    `Profile type ${profile.type} load implementation not implemented😵`
                );
        }
    }

    private _initclickhouseLoader(profile: LoadProfile): ClickHouseLoader {
        return new ClickHouseLoader(
            profile,
            this.env,
            this.logger,
            this.reporter
        );
    }
}
