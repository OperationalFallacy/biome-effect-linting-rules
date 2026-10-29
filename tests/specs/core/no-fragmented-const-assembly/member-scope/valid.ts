const workflow = {
  ...baseJob,
  steps: [checkout, corepack, ...existingSteps.slice(1)],
};

const request = {
  ...defaults,
  retries: attempts.map((attempt) => ({ ...attempt, delay: 100 })),
};
