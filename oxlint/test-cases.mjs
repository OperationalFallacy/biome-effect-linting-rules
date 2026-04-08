function sample(code, options = {}) {
  return {
    code: `${code.trim()}\n`,
    filename: options.filename ?? "sample.ts",
    files: options.files ?? {},
  };
}

function effectSample(code, options = {}) {
  return sample(`"effect";\n${code}`, options);
}

export const oxlintRuleCases = [
  {
    name: "no-if-statement",
    valid: [effectSample(`const ready = true;`)],
    invalid: [effectSample(`
      declare const ready: boolean;
      if (ready) {
        console.log("ready");
      }
    `)],
  },
  {
    name: "no-switch-statement",
    valid: [effectSample(`const status = 1;`)],
    invalid: [effectSample(`
      declare const status: string;
      switch (status) {
        case "open":
          break;
      }
    `)],
  },
  {
    name: "no-ternary",
    valid: [effectSample(`const ready = true;`)],
    invalid: [effectSample(`
      declare const ready: boolean;
      const value = ready ? "yes" : "no";
    `)],
  },
  {
    name: "no-return-null",
    valid: [effectSample(`
      function load(): string {
        return "ok";
      }
    `)],
    invalid: [effectSample(`
      function load(): null {
        return null;
      }
    `)],
  },
  {
    name: "no-try-catch",
    valid: [effectSample(`const load = Effect.succeed(1);`)],
    invalid: [effectSample(`
      try {
        console.log("side effect");
      } catch (error) {
        console.error(error);
      }
    `)],
  },
  {
    name: "prevent-dynamic-imports",
    valid: [sample(`import { value } from "./dep"; const next = value;`, {
      files: { "dep.ts": `export const value = 1;\n` },
    })],
    invalid: [sample(`
      async function load() {
        return import("./dep");
      }
    `, {
      files: { "dep.ts": `export const value = 1;\n` },
    })],
  },
  {
    name: "no-effect-async",
    valid: [effectSample(`const load = Effect.sync(() => 1);`)],
    invalid: [effectSample(`const load = Effect.async(() => {});`)],
  },
  {
    name: "no-effect-bind",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
    `)],
    invalid: [effectSample(`
      declare const base: any;
      declare const getUser: any;
      const load = Effect.bind(base, "user", () => getUser);
    `)],
  },
  {
    name: "no-effect-do",
    valid: [effectSample(`const load = Effect.succeed(1);`)],
    invalid: [effectSample(`const load = Effect.Do;`)],
  },
  {
    name: "no-effect-fn-generator",
    valid: [effectSample(`const load = Effect.fn((value: string) => Effect.succeed(value));`)],
    invalid: [effectSample(`
      declare const task: any;
      const load = Effect.fn(function* () {
        return yield* task;
      });
    `)],
  },
  {
    name: "no-effect-never",
    valid: [effectSample(`const load = Effect.void;`)],
    invalid: [effectSample(`const waitForever = Effect.never;`)],
  },
  {
    name: "no-effect-as",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.map(task, () => 1);
    `)],
    invalid: [effectSample(`
      declare const task: any;
      const load = Effect.as(task, 1);
    `)],
  },
  {
    name: "no-option-as",
    valid: [effectSample(`
      declare const value: any;
      const load = Option.map(value, () => 1);
    `)],
    invalid: [effectSample(`
      declare const value: any;
      const load = Option.as(value, 1);
    `)],
  },
  {
    name: "no-runtime-runfork",
    valid: [effectSample(`const load = Effect.succeed(1);`)],
    invalid: [effectSample(`
      declare const task: any;
      Runtime.runFork(task);
    `)],
  },
  {
    name: "no-react-state",
    valid: [sample(`
      function App() {
        return 1;
      }
    `)],
    invalid: [sample(`
      import { useState } from "react";
      function App() {
        const [value, setValue] = useState(0);
        return value + setValue.length;
      }
    `)],
  },
  {
    name: "no-string-sentinel-return",
    valid: [effectSample(`const load = Effect.succeed(1);`)],
    invalid: [effectSample(`const load = Effect.succeed("ready");`)],
  },
  {
    name: "no-string-sentinel-const",
    valid: [effectSample(`const status = 1;`)],
    invalid: [effectSample(`const status = "ready";`)],
  },
  {
    name: "no-manual-effect-channels",
    valid: [effectSample(`type Load = string;`)],
    invalid: [effectSample(`type Load = Effect.Effect<string, Error, never>;`)],
  },
  {
    name: "no-effect-type-alias",
    valid: [effectSample(`type Load = string;`)],
    invalid: [effectSample(`type Load = Effect.Effect<string, Error, never>;`)],
  },
  {
    name: "no-model-overlay-cast",
    valid: [effectSample(`const model = { id: 1 } as const;`)],
    invalid: [effectSample(`
      declare const decode: any;
      const model = decode() as User;
    `)],
  },
  {
    name: "no-fromnullable-nullish-coalesce",
    valid: [effectSample(`
      declare const value: string | null;
      const load = Option.fromNullable(value);
    `)],
    invalid: [effectSample(`
      declare const value: string | null;
      const load = Option.fromNullable(value ?? null);
    `)],
  },
  {
    name: "no-effect-sync-console",
    valid: [effectSample(`
      declare const value: number;
      const load = Effect.sync(() => value);
    `)],
    invalid: [effectSample(`const load = Effect.sync(() => console.log("x"));`)],
  },
  {
    name: "no-atom-registry-effect-sync",
    valid: [effectSample(`
      declare const value: number;
      const load = Effect.sync(() => value);
    `)],
    invalid: [effectSample(`
      declare const store: any;
      const load = Effect.sync(() => Atom.set(store, 1));
    `)],
  },
  {
    name: "no-branch-in-object",
    valid: [effectSample(`const config = { value: 1 };`)],
    invalid: [effectSample(`
      declare const input: any;
      const config = {
        value: Option.match(input, {
          onSome: (current: number) => current,
          onNone: () => 0,
        }),
      };
    `)],
  },
  {
    name: "no-call-tower",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
    `)],
    invalid: [effectSample(`
      declare const task: any;
      const load = Effect.flatMap(
        Effect.map(task, (value: unknown) => value),
        (value: unknown) => Effect.succeed(value),
      );
    `)],
  },
  {
    name: "no-effect-all-step-sequencing",
    valid: [sample(`
      declare const taskA: any;
      declare const taskB: any;
      const load = Effect.all([taskA, taskB]);
    `)],
    invalid: [sample(`
      declare const statusRef: any;
      const load = Effect.all(
        [Ref.set(statusRef, "loading"), Effect.logDebug("refresh:start")],
        { concurrency: 1 },
      );
    `)],
  },
  {
    name: "no-effect-call-in-effect-arg",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.map(task, (value: unknown) => value);
    `)],
    invalid: [effectSample(`
      const load = Effect.map(Effect.succeed(1), (value: number) => value);
    `)],
  },
  {
    name: "no-effect-orElse-ladder",
    valid: [effectSample(`
      declare const task: any;
      declare const fallback: any;
      const load = Effect.orElse(task, () => fallback);
    `)],
    invalid: [effectSample(`
      declare const task: any;
      declare const fallback: any;
      const load = Effect.orElse(
        Effect.tap(task, () => Effect.logInfo("x")),
        () => fallback,
      );
    `)],
  },
  {
    name: "no-effect-succeed-variable",
    valid: [effectSample(`const load = Effect.succeed({ value: 1 });`)],
    invalid: [effectSample(`
      declare const value: number;
      const load = Effect.succeed(value);
    `)],
  },
  {
    name: "no-flatmap-ladder",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
    `)],
    invalid: [effectSample(`
      declare const task: any;
      declare const other: any;
      const load = Effect.flatMap(
        task,
        (value: number) => Effect.flatMap(other, () => Effect.succeed(value)),
      );
    `)],
  },
  {
    name: "no-iife-wrapper",
    valid: [effectSample(`const value = (current: number) => current + 1;`)],
    invalid: [effectSample(`const value = ((current: number) => current + 1)(1);`)],
  },
  {
    name: "no-match-void-branch",
    valid: [effectSample(`const load = Match.when(true, () => 1);`)],
    invalid: [effectSample(`const load = Match.when(true, () => Effect.void);`)],
  },
  {
    name: "no-nested-effect-gen",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.gen(function* () {
        return yield* task;
      });
    `)],
    invalid: [effectSample(`
      declare const task: any;
      const load = Effect.gen(function* () {
        return yield* Effect.gen(function* () {
          return yield* task;
        });
      });
    `)],
  },
  {
    name: "no-option-boolean-normalization",
    valid: [effectSample(`
      declare const value: any;
      const load = Option.match(value, {
        onSome: (current: boolean) => current,
        onNone: () => false,
      });
    `)],
    invalid: [effectSample(`
      declare const value: any;
      const load = Option.match(value, {
        onSome: (current: boolean) => current === true,
        onNone: () => false,
      });
    `)],
  },
  {
    name: "no-pipe-ladder",
    valid: [effectSample(`
      declare const task: any;
      const load = pipe(task, normalize);
    `)],
    invalid: [effectSample(`
      declare const task: any;
      const load = pipe(task, (value: unknown) => pipe(value, normalize));
    `)],
  },
  {
    name: "no-arrow-ladder",
    valid: [effectSample(`const value = ((left: number) => left + 1)(1);`)],
    invalid: [effectSample(`
      const value = ((left: number) => ((right: number) => left + right)(2))(1);
    `)],
  },
  {
    name: "no-effect-ladder",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.map(task, (value: unknown) => value);
    `)],
    invalid: [effectSample(`
      const load = Effect.map(
        Effect.flatMap(Effect.succeed(1), (value: number) => Effect.succeed(value)),
        (value: number) => value,
      );
    `)],
  },
  {
    name: "no-effect-side-effect-wrapper",
    valid: [effectSample(`
      declare const task: any;
      declare const next: any;
      const load = Effect.zipRight(task, next);
    `)],
    invalid: [effectSample(`
      declare const task: any;
      const load = Effect.zipRight(Effect.logInfo("start"), task);
    `)],
  },
  {
    name: "no-effect-wrapper-alias",
    valid: [effectSample(`const formatValue = (value: number) => value + 1;`)],
    invalid: [effectSample(`const loadUser = () => Effect.succeed(1);`)],
  },
  {
    name: "no-inline-runtime-provide",
    valid: [effectSample(`
      declare const UserRuntime: any;
      const program = Effect.gen(function* () {
        return yield* UserRuntime;
      });
    `)],
    invalid: [effectSample(`
      declare const UserRuntime: any;
      declare const UserLive: any;
      const program = Effect.gen(function* () {
        return yield* UserRuntime.pipe(Effect.provide(UserLive));
      });
    `)],
  },
  {
    name: "no-match-effect-branch",
    valid: [effectSample(`
      declare const flag: boolean;
      const load = Match.value(flag).pipe(
        Match.when(true, () => 1),
        Match.orElse(() => 0),
      );
    `)],
    invalid: [effectSample(`
      declare const flag: boolean;
      const load = Match.value(flag).pipe(
        Match.when(true, () => Effect.succeed(1).pipe(Effect.tap(() => Effect.logInfo("x")))),
        Match.orElse(() => Effect.succeed(0)),
      );
    `)],
  },
  {
    name: "no-nested-effect-call",
    valid: [effectSample(`
      declare const task: any;
      const load = Effect.map(task, (value: unknown) => value);
    `)],
    invalid: [effectSample(`
      const load = Effect.map(
        Effect.flatMap(Effect.succeed(1), (value: number) => Effect.succeed(value)),
        (value: number) => value,
      );
    `)],
  },
  {
    name: "no-return-in-arrow",
    valid: [effectSample(`
      declare const value: any;
      const load = Option.map(value, (current: string) => current.trim());
    `)],
    invalid: [effectSample(`
      declare const value: any;
      const load = Option.map(value, (current: string) => {
        return current.trim();
      });
    `)],
  },
  {
    name: "no-return-in-callback",
    valid: [effectSample(`
      declare const items: string[];
      const load = Array.from(items, (value: string) => value.trim());
    `)],
    invalid: [effectSample(`
      declare const items: string[];
      const load = Array.from(items, function mapper(value: string) {
        return value.trim();
      });
    `)],
  },
  {
    name: "no-unknown-boolean-coercion-helper",
    valid: [effectSample(`
      declare const value: unknown;
      const isBoolean = typeof value === "boolean";
    `)],
    invalid: [effectSample(`
      declare const value: unknown;
      const isBoolean = typeof value === "boolean";
      const normalized = Match.value(value).pipe(Match.orElse(() => null));
    `)],
  },
  {
    name: "no-render-side-effects",
    valid: [effectSample(`
      declare const flag: boolean;
      const view = Match.value(flag).pipe(
        Match.when(true, () => 1),
        Match.orElse(() => 0),
      );
    `)],
    invalid: [effectSample(`
      declare const flag: boolean;
      Match.value(flag).pipe(
        Match.when(true, () => Effect.logInfo("x")),
        Match.orElse(() => 0),
      );
    `)],
  },
  {
    name: "no-wrapgraphql-catchall",
    valid: [effectSample(`
      declare const query: any;
      const load = wrapGraphqlCall(query);
    `)],
    invalid: [effectSample(`
      declare const query: any;
      const load = wrapGraphqlCall(query).pipe(
        Effect.catchAll(() => Effect.succeed(null)),
      );
    `)],
  },
  {
    name: "warn-effect-sync-wrapper",
    valid: [effectSample(`const load = Effect.sync(() => console.log("x"));`)],
    invalid: [effectSample(`
      declare const store: any;
      const load = Effect.sync(() => Atom.set(store, 1));
    `)],
  },
];
