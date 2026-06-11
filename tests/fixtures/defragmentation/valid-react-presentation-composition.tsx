import { Option, Result } from "effect";

type TaskState = "PENDING" | "WORKING" | "FAILED";

type TaskView = {
  readonly state: TaskState;
  readonly failureMessage: string | null;
  readonly id: string;
};

type TaskPresentation = {
  readonly label: string;
  readonly message: Option.Option<string>;
};

type TaskPresenter = (task: TaskView) => TaskPresentation;

declare const pendingResult: Result.Result<Option.Option<TaskView>, Error>;
declare const readAtom: (key: string) => boolean;
declare const approveAtom: (key: string) => () => void;

// Proper usage: a small message adapter returns a primitive presentation value.
const taskFailureMessage = (task: TaskView) =>
  Option.match(Option.fromNullable(task.failureMessage), {
    onNone: () => "No failure reason returned.",
    onSome: (message) => message,
  });

// Proper usage: this table declares the stable UI state mapping in one place.
const taskPresenters = {
  PENDING: () => ({
    label: "Pending",
    message: Option.some("Waiting for confirmation."),
  }),
  WORKING: () => ({
    label: "Working",
    message: Option.none<string>(),
  }),
  FAILED: (task) => ({
    label: "Failed",
    message: Option.some(taskFailureMessage(task)),
  }),
} satisfies Record<TaskState, TaskPresenter>;

const taskPresentation = (task: TaskView): TaskPresentation =>
  taskPresenters[task.state](task);

export function TaskControl({ fallbackId }: { readonly fallbackId: string }) {
  // Proper usage: React hook order can require a decoded key before later hooks.
  const taskKey = Result.match(pendingResult, {
    onFailure: () => fallbackId,
    onSuccess: (taskOption) =>
      Option.match(taskOption, {
        onNone: () => fallbackId,
        onSome: (task) => task.id,
      }),
  });
  const submitting = readAtom(taskKey);
  const approve = approveAtom(taskKey);

  // Proper usage: a local render helper keeps conditional JSX readable.
  const renderApprovalAction = () =>
    Option.match(Option.some(submitting), {
      onNone: () => null,
      onSome: (isSubmitting) => (
        <button type="button" disabled={isSubmitting} onClick={approve}>
          Confirm
        </button>
      ),
    });

  return (
    <section>
      {Option.match(Result.getOrElse(pendingResult, () => Option.none()), {
        onNone: () => null,
        onSome: (task) => taskPresentation(task).label,
      })}
      {renderApprovalAction()}
    </section>
  );
}
