import { Module, HttpModule } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { AuthController } from './auth.controller';
import { TokenService } from 'src/services/token.service';
import { DatabaseService } from 'src/services/database.service';
import { ServicesModule } from 'src/services/services.module';
import { UserController } from './user.controller';

@Module({
    imports: [ HttpModule, ServicesModule ],
    controllers: [ AuthController, UserController ],
    // providers: [UserService, TokenService, DatabaseService]
})
export class ControllersModule {}