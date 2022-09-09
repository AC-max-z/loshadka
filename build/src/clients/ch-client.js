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
exports.ClickHouseClient = void 0;
const clickhouse_1 = require("clickhouse");
class ClickHouseClient {
    constructor(options, logger) {
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
        this.clickhouse = new clickhouse_1.ClickHouse(this.options);
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
    insert(db, table, stuff) {
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
    createTableIfNotExists(db, table) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clickhouse
                .query(this._composeCreateTableQuery(table))
                .toPromise();
        });
    }
    /**
     * Composes SQL INSERT query
     * @private
     *
     * @param {Table} table
     *
     * @returns {string}
     */
    _composeInsertQuery(table) {
        const columnNames = [];
        table.columns.forEach((column) => columnNames.push(column.name));
        let statement;
        this.clusterName
            ? (statement = `INSERT INTO ${table.name} (${columnNames})`)
            : (statement = `INSERT INTO ${table.name} (${columnNames})`);
        console.log(`Insert statement: ${statement}`);
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
    _composeCreateTableQuery(table) {
        const columnNames = [];
        const dataTypes = [];
        table.columns.forEach((column) => {
            columnNames.push(column.name);
            dataTypes.push(column.type);
        });
        let tableDeclaration = '';
        columnNames.forEach((cName, index) => {
            tableDeclaration += `${cName} ${dataTypes[index]},\n`;
        });
        let statement;
        this.clusterName
            ? (statement = `CREATE TABLE IF NOT EXISTS ${table.name}
            ON CLUSTER ${this.clusterName} (${tableDeclaration})
            ENGINE=MergeTree() ORDER BY ${columnNames[0]}`)
            : (statement = `CREATE TABLE IF NOT EXISTS ${table.name} (${tableDeclaration}) ENGINE=MergeTree()`);
        console.log(`Create table statement: ${statement}`);
        return statement;
    }
    selectAll(table, chunkSize) {
        return this.clickhouse
            .query(`SELECT * FROM ${table.name} LIMIT ${chunkSize}`)
            .toPromise();
    }
    close() {
        //TODO: ??
    }
}
exports.ClickHouseClient = ClickHouseClient;
//# sourceMappingURL=ch-client.js.map