/**
 * Ref.modify computes an operation result and the next state in one atomic
 * update. Use it when Effect fibers need to coordinate a shared counter.
 */
export function advance(counter: { value: number; label?: string }) {
  var first = counter.value;
  let second = first;
  second = first + 1;
  counter.value++;
  ++counter.value;
  delete counter.label;
  return second;
}
