export const needToUpdateUserContextDetails = (lastConfirmedDate: Date | undefined): boolean => {
    let date = new Date();
    if (date.getMonth() < 7) { // Month is 0-indexed for some stupid reason
        date.setFullYear(date.getFullYear() - 1);
    }
    date.setMonth(7, 1);
    date.setHours(0, 0, 0, 0);
    // Date is now the 1st day of most recent August
    return !!lastConfirmedDate && lastConfirmedDate <= date;
}