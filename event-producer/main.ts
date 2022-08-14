import {
  AckPolicy,
  connect,
  consumerOpts,
  JSONCodec,
  NatsConnection,
  StorageType,
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
    nc.publish(SUBJECT_NAME, jc.encode(msg + index));
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

async function createJetstream(nc: NatsConnection) {
  const jsm = await nc.jetstreamManager();
  // get all streams
  const streams = await jsm.streams.list().next();
  console.log("streams count", streams.length);
  streams.forEach((s) => console.log(s));

  // add stream
  const stream_name = "mystream";
  const subj = "msg1";
  // await jsm.streams.delete(stream_name);
  await jsm.streams.add({
    name: stream_name,
    subjects: [subj],
    storage: StorageType.Memory,
  });
  return jsm;
}

async function main() {
  const nc = await connect({ servers: "nats://host.docker.internal:4222" });
  console.log("connected");
  const jsm = await createJetstream(nc);

  publish(nc);
  console.log("published");
  reply(nc);
  console.log("setup reply");

  const streamInfo = await jsm.streams.info("mystream");
  // console.log("info", streamInfo);
  const sm = await jsm.streams.getMessage("mystream", { seq: 1 });
  console.log("sm", sm);

  // consumer
  const consumerInfo = await jsm.consumers.add("mystream", {
    durable_name: "me",
    ack_policy: AckPolicy.Explicit,
  });

  // retrieve a consumer config
  const js = nc.jetstream();
  const msgs = await js.pull("mystream", "me");
  msgs.ack();
  console.log("msgs", msgs);
}

main();
