import { Effect } from "effect";
import { readProfile } from "./profile";

const loadProfile = Effect.fn("loadProfile")(() => readProfile);
