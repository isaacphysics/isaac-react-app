import { BookingStatus, EventBookingDTO, Gender, UserRole } from "../../../../../IsaacApiTypes";
import { countEventDetailsByRole } from "../../../../../app/components/elements/panels/EventGenderDetails";
import { mockEventBooking, mockEventBookings } from "../../../../../mocks/data";

const genders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", "UNKNOWN"] as Gender[];

const studentBookingsWithGenderAndStatus: EventBookingDTO[] = mockEventBookings.map((booking, index) => {
  const updatedBooking = {
    ...booking,
    bookingStatus: "CONFIRMED" as BookingStatus,
    userBooked: { ...booking.userBooked, gender: genders[index], role: "STUDENT" as UserRole },
  };
  return updatedBooking;
});
describe("countEventDetailsByRole", () => {
  it("returns an object with all genders and count set to 0 when there are no bookings", () => {
    const bookings = [] as EventBookingDTO[];
    const result = countEventDetailsByRole("STUDENT", bookings);
    expect(result).toEqual({
      genders: { male: 0, female: 0, other: 0, preferNotToSay: 0, unknown: 0 },
      numberOfConfirmedOrAttendedBookings: 0,
    });
  });

  it("should return the correct count of genders and count when passed an array of Event Bookings", () => {
    const result = countEventDetailsByRole("STUDENT", studentBookingsWithGenderAndStatus);
    expect(result).toEqual({
      genders: { male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 1 },
      numberOfConfirmedOrAttendedBookings: 5,
    });
  });

  it("should not count bookings with invalid bookingStatus", () => {
    const cancelledBooking: EventBookingDTO = {
      ...mockEventBooking,
      bookingStatus: "CANCELLED",
      userBooked: { ...mockEventBooking.userBooked, gender: "FEMALE" },
    };
    const results = countEventDetailsByRole("STUDENT", [...studentBookingsWithGenderAndStatus, cancelledBooking]);
    expect(results).toEqual({
      genders: { male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 1 },
      numberOfConfirmedOrAttendedBookings: 5,
    });
  });

  it("should count user bookings without a gender as Unknown", () => {
    const studentBookingWithUndefinedGender: EventBookingDTO = {
      ...mockEventBooking,
      bookingStatus: "CONFIRMED",
      userBooked: { ...mockEventBooking.userBooked, gender: undefined, role: "STUDENT" },
    };
    const results = countEventDetailsByRole("STUDENT", [
      ...studentBookingsWithGenderAndStatus,
      studentBookingWithUndefinedGender,
    ]);
    expect(results).toEqual({
      genders: { male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 2 },
      numberOfConfirmedOrAttendedBookings: 6,
    });
  });

  it("returns 0 if no event bookings with specified role exist", () => {
    const results = countEventDetailsByRole("TEACHER", studentBookingsWithGenderAndStatus);
    expect(results).toEqual({
      genders: { male: 0, female: 0, other: 0, preferNotToSay: 0, unknown: 0 },
      numberOfConfirmedOrAttendedBookings: 0,
    });
  });
});
