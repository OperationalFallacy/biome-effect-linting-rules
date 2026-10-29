import { Option } from "effect";

function nullResultLoad() {
  return null;
}

function optionalResultLoad() {
  return Option.none();
}
