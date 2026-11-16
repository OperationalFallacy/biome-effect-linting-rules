# Documentation remediation checklist

Remediate the completed content in fixture comments, rule diagnostics, documentation, and other repository text. Work through the checklist in order. Correct each defect you find before continuing to the next item.

## Meaning and requirements

- [ ] Replace hollow statements and slogans with the facts they omit. For example, replace "ensures correctness" with what is checked and what happens when the check fails. Rewrite disconnected lists as an explanation of how the listed things relate. Explain software behavior through what starts the operation, what the software does, and what result the caller receives. Give instructions that state who acts, when to act, and what action completes the instruction. Rewrite the whole affected paragraph so its sentences develop that explanation.

- [ ] Review each complete explanation under [writing rule 3](unslop.md#content). Replace gerund subjects, action fragments, and trailing `-ing` explanations with sentences that name who acts and what happens. Replace chains such as "by using...", "allowing...", and "ensuring..." with direct clauses. Preserve the reason and put each condition beside the action or result it affects. Reject a rewrite that merely replaces the gerund with an abstract noun or drops the explanation. Preserve identifiers and established technical terms; do not accept or reject prose from a suffix search alone.

- [ ] Replace invented terminology with the established name for the same concept. Verify names against their declarations, repository usage, and the relevant library or protocol documentation. Read checked-out upstream package documentation first. Keep identifiers exactly as declared, use the same term consistently, and explain unfamiliar terms before relying on them.

- [ ] Compare the explanation with the user's decisions and repository requirements, and restore any requirement lost during the rewrite. Read the implementation and its consumers to correct factual claims and establish which component performs each action. Distinguish work done by a Grit rule, the CLI, or the test runner from work done by Biome or Effect. Limit runtime guarantees and type claims to what that evidence establishes. Mark planned behavior as planned, and describe an implementation defect together with the behavior it prevents. Preserve supported facts and the reasons that connect them.

- [ ] Expand vague restrictions such as "unsupported" or "invalid" into an explanation of the affected action and its consequence. State whether the API omits the operation or rejects a call. For a rejected call, explain the condition that causes rejection and the failure the caller receives.

- [ ] Replace implementation narration in specifications with the required behavior and its reason, following the [fixture guide](rules-development.md#write-fixtures-as-learning-examples). For repository implementation code only, rewrite API explanations around how the caller invokes the operation and interprets its result, following the [code documentation guide](code-documentation.md). Do not apply that guide to fixture or composition examples. Repair operating instructions with the steps and commands needed to complete the operation. Replace vague agent instructions with the action to perform and the condition that determines when it is complete.

- [ ] Remove repeated points, introductions that merely restate headings, and conclusions that repeat the preceding explanation. State behavior directly wherever a rhetorical contrast obscures it. Apply the humanizer skill and [writing guidance](unslop.md) to the complete revised prose.

## Review the result and restage

- [ ] Read the finished content from beginning to end. Review fixture comments together under their [separate roles](rules-development.md#write-fixtures-as-learning-examples). Keep the explanation in the main comment. Each inline pattern marker identifies the adjacent correct or incorrect form. For each explanation, verify that the reader can identify its subject, understand what happens, and follow why its statements belong together. For each instruction, verify that the reader can tell what to do and when the action is complete. Review test names, headings, and inline comments as well as paragraphs so action fragments do not survive outside the main prose. Apply the first three checklist items again and repair every remaining defect. After each repair, reread the complete affected explanation. Complete this review only when that reread finds none of the defects listed above.

- [ ] Correct broken links and examples that disagree with the explanation they demonstrate. Run the documented checks affected by those corrections, and retain passing results for unchanged work.

- [ ] Stage or restage only the requested files after completing the repairs and self-review. Read the staged content to verify that it contains the reviewed corrections. Repair and recheck any defect found there before restaging. Preserve unrelated staged and unstaged work.
