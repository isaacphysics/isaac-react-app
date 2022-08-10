// Returns true if lastConfirmedDate is before *last August*, and it's at least the 24th of August. False otherwise
export const needToUpdateUserContextDetails = (lastConfirmedDate: Date | undefined) => {
    // First calculate when the beginning of last August before today was...
    let date = new Date();
    if (date.getMonth() <= 7) { // Month is 0-indexed for some stupid
        date.setFullYear(date.getFullYear() - 1);
    }
    date.setMonth(7, 1);
    date.setHours(0, 0, 0, 0);
    // Date is now the 1st day of last August...

    // If the user last confirmed their registered contexts before last August...
    if (lastConfirmedDate && lastConfirmedDate < date) {
        // Check if we're past the 24th of the August after
        date.setDate(24);
        date.setFullYear(date.getFullYear() + 1);
        // Date is now the 24th of the August *after the last one* (the last week, give or take)
        if (Date.now() > date.valueOf()) {
            return true;
        }
    }
    return false;
}