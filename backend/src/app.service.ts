import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BACKEND_CLIENT } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(BACKEND_CLIENT) private client: ClientProxy) {}
  getHello(): string {
    return 'Hello World!';
  }

  async getMsg2() {
    const data = this.client.send('msg2', {});
    // data is observable so we have to subscribe that observable to see msg
    const sub = data.subscribe((res) => {
      console.log('res data', res);
      sub.unsubscribe();
    });
    return data;
  }
}
