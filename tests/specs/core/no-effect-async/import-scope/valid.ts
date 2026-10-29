import { Effect } from "task-builder";

const registration = Effect.async((resume) => subscribe(resume));
const genericRegistration = Effect.async<number>((resume) => subscribe(resume));
