import { eventAttendancePercentage } from "../../app/components/elements/panels/EventOverviews";

describe("eventAttendancePercentage", () => {
  it("returns '-' if the percentage is NaN", () => {
    expect(eventAttendancePercentage(0, 0)).toEqual("-");
  });

  it("returns a whole number percentage if no decimal places required", () => {
    expect(eventAttendancePercentage(4, 4)).toEqual("50%");
  });

  it("returns the correct % if all attendees are present and none absent", () => {
    expect(eventAttendancePercentage(10, 0)).toEqual("100%");
  });

  it("returns the correct % if all attendees are absent and none present", () => {
    expect(eventAttendancePercentage(0, 10)).toEqual("0%");
  });

  it("returns a % to 1 decimal place if it's not a whole number", () => {
    expect(eventAttendancePercentage(5, 1)).toEqual("83.3%");
  });

  it("can handle large numbers of attendees, and rounds down to nearest decimal", () => {
    expect(eventAttendancePercentage(9999, 1)).toEqual("99.9%");
  });
});
