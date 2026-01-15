export function createFormData<T extends Record<string, unknown>>(data: T): FormData {
  const fd = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof FileList) {
      fd.append(key, value[0]);
    } 
    else if (value instanceof File) {
      fd.append(key, value);
    } 
    else if (value !== undefined && value !== null) {
      // numbers / booleans / strings → convert to string
      fd.append(key, String(value));
    }
  });

  return fd;
}
