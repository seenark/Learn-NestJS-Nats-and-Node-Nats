import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('msg1')
  rcvdMsg1(@Payload() payload: string) {
    this.logger.log(payload);
    return payload;
  }

  @Get('/msg2')
  getMsg2() {
    return this.appService.getMsg2();
  }
}
