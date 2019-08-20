import { Injectable, LoggerService, Logger } from '@nestjs/common';
import { MongoClient, Db, FilterQuery } from 'mongodb';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';

@Injectable()
export class DatabaseService {

    private readonly logger = new Logger(DatabaseService.name);

    private client: MongoClient;
    private URL: string;
    private DB_NAME: string;

    private database: Db;

    private connectedSubject = new BehaviorSubject(false);

    constructor(config: ConfigService) {
        this.URL = config.get('DATABASE_URL');
        this.DB_NAME = config.get('DB_NAME');

        this.connect().then();
    }

    public isConnected() {
        return this.connectedSubject.asObservable();
    }

    public async findDocument(collection: string, query: FilterQuery<any>): Promise<any> {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).findOne(query);
    }

    public async findDocuments(collection: string, query: FilterQuery<any>) {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).find(query);
    }

    public async replaceDocument(collection: string, query: FilterQuery<any>, document: any) {
        if (!this.checkIfConnected()) {
            return;
        }

        return (await this.database.collection(collection).replaceOne(query, document)).result;
    }

    public async insertDocument(collection: string, document: any) {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).insertOne(document);
    }

    public async searchFromField(collection: string, fieldName: string, value: string) {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).find({ [fieldName]: { $regex: value }});
    }

    public async deleteDocumentByQuery(collection: string, query: FilterQuery<any>) {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).deleteOne(query);
    }

    public async deleteDocumentsByQuery(collection: string, query: FilterQuery<any>) {
        if (!this.checkIfConnected()) {
            return;
        }

        return await this.database.collection(collection).deleteMany(query);
    }

    public async createIndex(collection: string, fieldName: string, indexType: string | number, options?: object) {
        if (!this.checkIfConnected()) {
            return;
        }

        if (options) {
            this.database.collection(collection).createIndex({ [fieldName]: indexType, options });
        } else {
            this.database.collection(collection).createIndex({ [fieldName]: indexType });
        }
    }

    private async connect() {
        this.client = await (new MongoClient(this.URL, { native_parser: true, useNewUrlParser: true })).connect();
        this.database = this.client.db(this.DB_NAME);
        this.connectedSubject.next(true);

        this.logger.log('Connected to MongoDB');
    }

    private checkIfConnected() {
        if (!this.database) {
            this.logger.log('Database not connected yet!');
            return false;
        }

        return true;
    }
}
