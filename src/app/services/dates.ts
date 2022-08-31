declare global {
    interface Date {
        addDays(n: number): Date;
    }
}
Date.prototype.addDays = function (days: number) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
export {};