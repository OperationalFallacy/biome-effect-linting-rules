import { Option } from "effect";

{
  const curriedResult = Option.as(1);
}

{
  const dataFirstResult = Option.as(option, 1);
}

{
  const genericResult = Option.as<number>(1);
}

{
  const nestedOptionResult = Option.as(Option.some(1), 2);
}

const mappedResult = Option.map(Option.some(1), () => 2);
