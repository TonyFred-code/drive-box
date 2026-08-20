function handleUniqueConstraintError(error) {
  return error.meta?.driverAdapterError?.cause?.constraint?.fields ?? [];
}

export { handleUniqueConstraintError };
