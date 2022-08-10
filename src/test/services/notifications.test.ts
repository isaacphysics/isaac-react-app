import {needToUpdateUserContextDetails} from "../../app/state/middleware/utils";

jest.useFakeTimers();

describe("Account detail reconfirmation modal is shown at the correct times", () => {
    it("Doesn't show the modal if the user has updated their details since last August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-09-01")); //
        expect(needToUpdateUserContextDetails(new Date("2000-04-01"))).toBe(false);
    })
    it("Doesn't show the modal if the user hasn't updated their details since last August, but it isn't 24th August yet", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-01"));
        expect(needToUpdateUserContextDetails(new Date("1999-04-01"))).toBe(false);
    })
    it("Shows the modal if the user hasn't updated their details since last August, and it's past the 24th August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("1999-04-01"))).toBe(true);
    })
    it("Doesn't show the modal if the date is between August 1st and 24th of the current year, and current date is 25th August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("2000-08-10"))).toBe(false);
    })
    it("Doesn't show the modal if the date is between August 24th and 31st of the current year, and current date is 25th August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("2000-08-28"))).toBe(false);
    })
    it("Doesn't show the modal if somehow the given date is far into the future", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("2100-08-30"))).toBe(false);
    })
});
