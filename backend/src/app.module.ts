import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BACKEND_CLIENT } from './constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BACKEND_CLIENT,
        transport: Transport.NATS,
        options: {
          servers: ['nats://host.docker.internal:4222'],
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
