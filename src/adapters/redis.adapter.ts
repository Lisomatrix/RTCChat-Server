import * as redisIoAdapter from 'socket.io-redis';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

// const redisAdapter = redisIoAdapter({ host: '127.0.0.1', port: 6379 });

// export class RedisIoAdapter extends IoAdapter {
//   createIOServer(port: number, options?: ServerOptions): any {
//     const server = super.createIOServer(port, options);
//     server.adapter(redisAdapter);
//     return server;
//   }
// }
