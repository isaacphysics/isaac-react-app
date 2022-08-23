export const augmentErrorMessage = (message?: string) => (e: Error) => {
    return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
}