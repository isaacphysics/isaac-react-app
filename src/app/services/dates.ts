export const nthHourOf = (n: number, d: Date | number) => {
    const newDate = new Date(d.valueOf());
    newDate.setHours(n, 0, 0, 0);
    return newDate;
};

export const TODAY = () => {
    return nthHourOf(0, new Date(Date.now()));
};

export const UTC_MIDNIGHT_IN_SIX_DAYS = () => {
    return addUtcDays(6, nthUtcHourOf(0, new Date(Date.now())));
};

export const MONTH_NAMES = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

export const nthUtcHourOf = (n: number, d: Date | number) => {
    const newDate = new Date(d.valueOf());
    newDate.setUTCHours(n, 0, 0, 0);
    return newDate;
};

const addUtcDays = (days: number, date: Date, ) => {
    const newDate = new Date(date.valueOf());
    newDate.setUTCDate(date.getUTCDate() + days);
    return newDate;
};