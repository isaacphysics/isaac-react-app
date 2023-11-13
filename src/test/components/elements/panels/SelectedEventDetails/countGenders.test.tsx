import { BookingStatus, EventBookingDTO, Gender } from "../../../../../IsaacApiTypes";
import { countGenders } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { mockEventBooking, mockEventBookings } from "../../../../../mocks/data";

const genders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY", "UNKNOWN"] as Gender[];
const bookingsWithGenderAndStatus: EventBookingDTO[] = mockEventBookings.map((booking, index) => {
  const updatedBooking = {
    ...booking,
    bookingStatus: "CONFIRMED" as BookingStatus,
    userBooked: { ...booking.userBooked, gender: genders[index] },
  };
  return updatedBooking;
});
describe("countGenders", () => {
  it("returns an object with all genders set to 0 when there are no bookings", () => {
    const bookings = [] as EventBookingDTO[];
    const result = countGenders(bookings);
    expect(result).toEqual({ male: 0, female: 0, other: 0, preferNotToSay: 0, unknown: 0 });
  });

  it("should return the correct count of genders when passed an array of Event Bookings", () => {
    const result = countGenders(bookingsWithGenderAndStatus);
    expect(result).toEqual({ male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 1 });
  });

  it("should not count bookings with invalid bookingStatus", () => {
    const cancelledBooking: EventBookingDTO = {
      ...mockEventBooking,
      bookingStatus: "CANCELLED",
      userBooked: { ...mockEventBooking.userBooked, gender: "FEMALE" },
    };
    const results = countGenders([...bookingsWithGenderAndStatus, cancelledBooking]);
    expect(results).toEqual({ male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 1 });
  });

  it("user bookings without a gender are counted as Unknown gender", () => {
    const bookingWithUndefinedGender: EventBookingDTO = {
      ...mockEventBooking,
      bookingStatus: "CONFIRMED",
      userBooked: { ...mockEventBooking.userBooked, gender: undefined },
    };
    const results = countGenders([...bookingsWithGenderAndStatus, bookingWithUndefinedGender]);
    expect(results).toEqual({ male: 1, female: 1, other: 1, preferNotToSay: 1, unknown: 2 });
  });
});
