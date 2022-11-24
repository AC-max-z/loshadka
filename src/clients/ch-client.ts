import { ClickHouse } from 'clickhouse';
import winston = require('winston');
import { Auth, Environment, Db, Table } from '../types/test-config';

type ClickHouseConnectionOptions = {
    url: string;
    port: string | number;
    debug?: boolean;
    basicAuth?: Auth;
    isUseGzip?: boolean;
    trimQuery?: boolean;
    usePost?: boolean;
    format?: string;
    raw?: boolean;
    config?: {
        session_timeout?: number;
        output_format_json_quote_64bit_integers?: number;
        enable_http_compression?: number | boolean;
        database?: string;
    };
};

export class ClickHouseClient {
    options: ClickHouseConnectionOptions;
    clickhouse: ClickHouse;
    clusterName: string | null;
    logger: winston.Logger;

    constructor(options: Environment, logger: winston.Logger) {
        this.options = {
            url: options.clickhouseCluster.entrypoint,
            port: options.clickhouseCluster.port,
            debug: false,
            basicAuth: options.clickhouseCluster.auth || null,
            isUseGzip: false,
            trimQuery: false,
            usePost: false,
            format: 'json',
            raw: false,
            config: {
                session_timeout: 60,
                output_format_json_quote_64bit_integers: 0,
                enable_http_compression: 0,
                database: options.clickhouseCluster.dbName || null,
            },
        };
        this.clickhouse = new ClickHouse(this.options);
        this.clusterName = options.clickhouseCluster.cluster || null;
        this.logger = logger;
    }

    /**
     * Sends INSERT query to CH
     *
     * @param {Db} db
     * @param {Table} table
     * @param {Array<Object>|Object} stuff
     *
     * @returns {Promise<>}
     * @throws
     */
    public insert(
        db: Db,
        table: Table,
        stuff: object | object[]
    ): Promise<object[]> {
        if (!Array.isArray(stuff)) {
            stuff = [stuff];
        }
        return this.clickhouse
            .insert(this._composeInsertQuery(table), stuff)
            .toPromise();
    }

    /**
     * Creates table with specified name and columns in specified DB
     *
     * @param {Db} db
     * @param {Table} table
     *
     * @returns {Promise<>}
     * @throws
     */
    public async createTableIfNotExists(
        db: Db,
        table: Table
    ): Promise<unknown> {
        return this.clickhouse
            .query(this._composeCreateTableQuery(table))
            .toPromise();
    }

    /**
     * Composes SQL INSERT query
     * @private
     *
     * @param {Table} table
     *
     * @returns {string}
     */
    private _composeInsertQuery(table: Table): string {
        const columnNames: string[] = [];
        table.columns.forEach(column => columnNames.push(column.name));
        let statement: string;
        this.clusterName
            ? (statement = `INSERT INTO ${table.name} (${columnNames})`)
            : (statement = `INSERT INTO ${table.name} (${columnNames})`);
        return statement;
    }

    /**
     * Composes SQL CREATE TABLE query
     * @private
     *
     * @param {Table} table
     *
     * @returns {string}
     */
    private _composeCreateTableQuery(table: Table): string {
        const columnNames: string[] = [];
        const dataTypes: string[] = [];
        table.columns.forEach(column => {
            columnNames.push(column.name);
            dataTypes.push(column.type);
        });

        let tableDeclaration = '';
        columnNames.forEach((cName, index) => {
            tableDeclaration += `${cName} ${dataTypes[index]},\n`;
        });
        let statement: string;
        this.clusterName
            ? (statement = `CREATE TABLE IF NOT EXISTS ${table.name}
            ON CLUSTER ${this.clusterName} (${tableDeclaration})
            ENGINE=MergeTree() ORDER BY ${columnNames[0]}`)
            : (statement = `CREATE TABLE IF NOT EXISTS ${table.name} (${tableDeclaration}) ENGINE=MergeTree()`);
        return statement;
    }

    public selectSpecificFields(
        table: Table,
        chunkSize: number,
        fields?: string[],
        order?: string | string[]
    ) {
        // TODO: implement me
    }

    public selectAllTop(table: Table, chunkSize: number) {
        return this.clickhouse
            .query(`SELECT * FROM ${table.name} LIMIT ${chunkSize}`)
            .toPromise();
    }

    public selectAll(table: Table) {
        return this.clickhouse
            .query(`SELECT * FROM ${table.name}}`)
            .toPromise();
    }

    public close() {
        //TODO: ??
    }
}
