import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClient, print } from 'redis';
import { promisify } from 'util';

@Injectable()
export class RedisService {

    private readonly logger = new Logger(RedisService.name);
    private client: RedisClient;
    private getAsync;

    constructor() {
        this.client = createClient();

        this.getAsync = promisify(this.client.get).bind(this.client);

        this.client.on('error', (err) => {
            this.logger.error(err);
        });

        this.client.once('connect', () => {
            this.logger.log('Connected to Redis!');
        });
    }

    public setValue(key: string, value: any) {
        this.client.set(key, value, (status, reply) => {
            if (status && status.message) {
                this.logger.error(status.name + ': ' + status.message);
            }
        });
    }

    public async getValue(key: string) {
        return await this.getAsync(key);
    }
}
