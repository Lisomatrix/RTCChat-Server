import { Module, HttpModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ServicesModule } from '../services/services.module';
import { UserController } from './user.controller';

@Module({
    imports: [ HttpModule, ServicesModule ],
    controllers: [ AuthController, UserController ],
})
export class ControllersModule {}
