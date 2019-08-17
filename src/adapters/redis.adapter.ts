import * as redisIoAdapter from 'socket.io-redis';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import * as customParser from 'socket.io-msgpack-parser';

const redisAdapter = redisIoAdapter({ host: '127.0.0.1', port: 6379 });

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
        parser: customParser,
    }) as Server;
    server.adapter(redisAdapter);
    return server;
  }
}
