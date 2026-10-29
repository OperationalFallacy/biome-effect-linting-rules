const response = {
  status: 400,
  body: {
    type: "ValidationFailure",
    ...errorFields(cause),
  },
};
