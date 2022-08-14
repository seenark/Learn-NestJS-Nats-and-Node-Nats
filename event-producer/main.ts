import {
  connect,
  JSONCodec,
  NatsConnection,
  StringCodec,
  Subscription,
} from "nats";
import { setTimeout } from "timers/promises";

const SUBJECT_NAME = "msg1";

// const sc = StringCodec();
const jc = JSONCodec();
async function publish(nc: NatsConnection) {
  const msg = "hello from event producer";

  for (let index = 0; index < 3; index++) {
    nc.publish(SUBJECT_NAME, jc.encode(msg));
    await setTimeout(1000);
  }
}

async function reply(nc: NatsConnection) {
  const sub = nc.subscribe("msg2");

  const runSubLoop = async () => {
    for await (const m of sub) {
      const msg = "Reply from Event producer";
      m.respond(jc.encode(msg));
    }
  };

  runSubLoop();
}

async function main() {
  const nc = await connect({ servers: "nats://host.docker.internal:4222" });
  publish(nc);
  reply(nc);
}

main();
