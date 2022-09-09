export interface TestConfig {
    environment: Environment;
    loadProfiles: LoadProfile[];
}

export interface LoadProfile {
    iterations?: number;
    type: LoadProfileType;
    chunkSize?: number;
    amount?: number;
    db?: Db;
    table?: Table;
    payload?: {
        type: string;
    };
    data?: {
        columns: string[];
        groupBy: string[];
    };
}

export enum LoadProfileType {
    Insert = 'INSERT',
    Select = 'SELECT',
}

export interface Environment {
    clickhouseCluster?: {
        entrypoint: string;
        port: string | number;
        auth?: Auth | null;
        dbName?: string;
        cluster?: string;
    };
}

export type Auth = {
    type: string;
    credentials: {
        name: string;
        password: string;
    };
};

export type Db = {
    name: string;
};

export type Table = {
    name: string;
    columns: Column[];
};

export type Column = {
    name: string;
    type: string; //TODO: can add a ENUM here for clickhouse column data types
};
