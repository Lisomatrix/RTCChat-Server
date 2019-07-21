import { Injectable } from "@nestjs/common";
import { MongoClient, Db, FilterQuery } from "mongodb";

@Injectable()
export class DatabaseService {

    private client: MongoClient;
    private URL = 'mongodb+srv://chat_application:tictic5532@chat-050ph.azure.mongodb.net/test?retryWrites=true&w=majority';
    private DB_NAME = 'chat';

    private database: Db;

    constructor() {
        this.client = new MongoClient(this.URL, { native_parser: true, useNewUrlParser: true });
        this.client.connect().then(result => {
            this.client = result;
            this.database = this.client.db(this.DB_NAME);
            console.log('MongoDB Connected!');
        });
    }

    public async findDocument(collection: string, query: FilterQuery<any>): Promise<any> {
        return await this.database.collection(collection).findOne(query);
    }

    public async findDocuments(collection: string, query: FilterQuery<any>) {
        return await this.database.collection(collection).find(query);
    }

    public async replaceDocument(collection: string, query: FilterQuery<any>, document: any) {
        return (await this.database.collection(collection).replaceOne(query, document)).result;
    }

    public async insertDocument(collection: string, document: any) {
        return await this.database.collection(collection).insertOne(document);
    }
}