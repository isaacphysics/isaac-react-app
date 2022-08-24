import {needToUpdateUserContextDetails} from "../../app/state";

jest.useFakeTimers();

describe("Account detail reconfirmation modal is shown at the correct times", () => {
    it("Doesn't show the modal if the user has updated their details since last August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-09-01")); //
        expect(needToUpdateUserContextDetails(new Date("2000-08-02"))).toBe(false);
    })
    it("Shows the modal if the user hasn't updated their details since most recent August", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("1999-04-01"))).toBe(true);
        expect(needToUpdateUserContextDetails(new Date("2000-07-25"))).toBe(true);
    })
    it("Doesn't show the modal if somehow the given date is far into the future", async () => {
        jest.useFakeTimers().setSystemTime(new Date("2000-08-25"));
        expect(needToUpdateUserContextDetails(new Date("2100-08-30"))).toBe(false);
    })
});
