const required = (type: StringConstructor | NumberConstructor) => ({
  type,
  required: true,
});

export { required };
