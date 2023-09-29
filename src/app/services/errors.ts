import { ErrorState } from "../state";

export function extractErrorMessage(error?: ErrorState | null): string | null {
    if (error?.type === "generalError") {
        return error.generalError;
    } else {
        return null;
    }
}
