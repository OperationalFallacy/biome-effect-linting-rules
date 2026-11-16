Edit or update text/output to remove AI patterns. Scan for the patterns below, then rewrite. Preserve the intended message and tone.

## Patterns to detect and fix

Rule numbers are stable ids that other skills cite. A removed rule leaves a gap.

### Content

3. **Gerund subjects, action fragments, and trailing -ing clauses.** Name who acts and give that subject a direct verb. This requirement applies to documentation, diagnostics, implementation comments, fixture comments, and test descriptions. Do not make an action ending in `-ing` the subject of an explanation, use it as a fragment in place of a sentence, or attach it as a trailing explanation. Those forms often omit who acts, why the action matters, or what follows from it.

   Replace "Checking the full preset catches conflicts" with "The fixture runner checks the full preset and rejects unrelated diagnostics." Replace "Reading the count through an atom" with "The component reads the count through an atom." An inline fixture marker also states the judgment: "It correctly reads the count through an atom."

   Replace "Continue the pipeline, preserving the result" with "Continue the pipeline. Preserve the result." Replace "The decoder checks the input, ensuring safe writes" with "The decoder rejects an invalid record before the service writes it."

   Rewrite the whole affected explanation so the actor, action, conditions, and consequence remain connected. A noun substitution such as "validation ensures safety" leaves the same omissions. Do not repair the sentence through a mechanical word swap or remove the reason just to shorten it. Keep API identifiers and established technical terms intact. A search for `-ing` can locate candidates for review; it cannot determine whether a sentence violates this rule.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Say "is" or "has".
9. **"Not just X, but Y."** State the point directly instead.
10. **Rule of three.** Don't force ideas into groups of three. Use the natural number.
11. **Repeated synonym substitutions.** Protagonist, main character, central figure, hero all in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y aren't on a meaningful scale. List topics directly.

### Style

13. **Em dash overuse.** Avoid em dashes entirely. Use periods or commas only (no parentheses, no en dashes, no hyphen-as-dash substitutes). If a thought needs separation, end the sentence or use a comma.
14. **Colon overuse.** Use colons before a list or example. Connect clauses within a sentence with the appropriate conjunction. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions" uses a colon as a crutch. State the instruction directly. "Describe when the scheduler should fire in plain English." Preserve the instruction and omit the comparison.
15. **Boldface overuse.** Don't bold every proper noun or acronym.
16. **Inline-header lists.** The tell is a bold label and colon that restates the line: "**Performance:** Performance improved...". Convert those to prose. A bold lead-in that ends in a period, names the item, and is followed by genuinely new detail ("**Schema in TypeScript.** Tables live in one file.") can help the reader identify the subject.
17. **Title case headings.** Use sentence case.
18. **Decorative emojis.** Remove from headings and bullets.
19. **Curly quotes.** Use straight quotes.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Respond directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". Delete "It is important to note that".
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." State specific plans or facts.

### Jargon

26. **Abstract metaphor nouns.** Substrate (base), wedge, wedge in (add), vector (way, method), locus, vantage, nexus, primitive as a noun, harness as a metaphor, surface as in "API surface", bedrock, scaffolding as a metaphor, modality, paradigm, gold-plating (more than the job needs), ratchet as a metaphor (the mechanism's real name, or a limit that only tightens), evacuate as a verb for code you move, endgame (the last phase), north star, flywheel. These read as technical but usually have a plainer concrete word. Pick the concrete word.

### Plain speech

27. **Describe concrete behavior.** "the database stays close at hand", "SQL you can read", "types that follow your schema" name a feeling. The fix names the mechanism or a number: "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". Ask what the sentence tells the reader to do or know, then write that. If you can't restate it as a concrete instruction, fact, or number, cut it. One more check: if the sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
28. **Shorten or split dense sentences.** If the reader has to backtrack to parse a sentence, break it in two or drop clauses. One idea per sentence.
29. **Active voice.** Prefer it. Catch "is/are/was/were + past participle" and name the actor: "queries are validated" becomes "the compiler validates queries", "the file is parsed by the loader" becomes "the loader parses the file". Passive is fine only when the actor is unknown or genuinely doesn't matter.
30. **Cut adverbs, or use a stronger verb.** "runs quickly" becomes "is fast" or the number, and "significantly improves" becomes the measured delta. Replace a weak verb that relies on an adverb with a precise verb.
31. **Prefer the plain word.** "utilize" and "leverage" become "use", "facilitate" becomes "help", "numerous" becomes "many", "in the event that" becomes "if". The fancier synonym is rarely clearer.
32. **Mannered prose.** Metaphor or flourish where a literal phrase exists: aphorisms ("wire it or delete it"), rhetorical fragments for effect, personified code ("the plan holds it"), figurative verbs ("rides along", "stands on"), stock introductory phrases. "A dial worth turning" becomes "a parameter to adjust". Say what you mean. Rule 26 covers the metaphor nouns.
33. **Over-compression.** Dropped articles, verbless fragments, symbol-speak, and abbreviations that make the reader decode instead of read. "Parser rejects bad date → exit 2, no write" becomes "The parser rejects a bad date, exits with code 2, and writes nothing." Write whole sentences with their articles and verbs, and spell out arrows and abbreviations.

34. **Vague ownership and boundaries.** Name the service, operation, or configuration involved. Use "own" and "boundary" only when they explain a concrete relationship.

35. **Noun chains.** Replace stacked nouns with complete phrases that state the relationship. Replace "provider field access" with "the helper reads a field from the provider." Use articles, verbs, and prepositions so the reader does not have to guess how the nouns relate. Preserve API identifiers and established technical terms.

36. **Subject and action first.** Name who acts, then state what that subject does. Put the purpose, conditions, and consequences after the action they concern. Rewrite the whole sentence if its opening leaves the actor or action implicit. Do not make the reader work backward through the sentence to find its main point.
