import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors as
      Record<string, string[]> | undefined;
    const firstValidationError = errors
      ? Object.values(errors).flat().at(0)
      : undefined;

    return (
      firstValidationError ??
      error.response?.data?.message ??
      "The request could not be completed."
    );
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}
