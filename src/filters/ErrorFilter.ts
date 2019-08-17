import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class ErrorFilter implements ExceptionFilter {

  private logger = new Logger(ErrorFilter.name);

  catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    const res = host.switchToWs().getData();

    this.logger.debug(res);
    this.logger.error(error.stack);
    this.logger.error(error.message);
  }
}
