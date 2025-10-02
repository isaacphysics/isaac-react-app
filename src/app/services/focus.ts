export const focusMainContent = (mainContentId: string) => {
    const element = document.getElementById(mainContentId);
    if (element) {
        element.focus();
    }
};
