export const nthHourOf = (n: number, d: Date | number) => {
    const newDate = new Date(d.valueOf());
    newDate.setHours(n, 0, 0, 0);
    return newDate;
}

export const TODAY = () => {
    return nthHourOf(0, new Date());
}

export const MONTH_NAMES = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
