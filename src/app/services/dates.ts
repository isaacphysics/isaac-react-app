export const TODAY = () => {
    const d = new Date();
    d.setUTCHours(0,0,0,0);
    return d;
}

export const nthHourOf = (n: number, d: Date) => {
    const newDate = new Date(d.valueOf());
    newDate.setUTCHours(n, 0, 0, 0);
    return newDate;
}

export const MONTH_NAMES = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
