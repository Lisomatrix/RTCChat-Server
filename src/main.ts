import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
// import { RedisIoAdapter } from './adapters/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // cors: {
    //   origin: true,
    //   preflightContinue: false,
    //   credentials: true,
    //   allowedHeaders: [
    //     ''
    //   ]
    // }
  });

  // app.use(function(req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept"
  //   );
  //   res.header(
  //     "Access-Control-Allow-Credentials",
  //     "true"
  //   )
  //   next();
  // });

  // app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.useStaticAssets(join(__dirname, "..", "public"));
  app.enableCors({ credentials: true, origin: true });

  await app.listen(3000);
}
bootstrap();
