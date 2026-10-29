import { Effect } from "effect";

const deliver = sendNotification.pipe(Effect.andThen(recordDelivery));
