import { EventBookingDTO } from "../../../../../IsaacApiTypes";
import { countStudentsAndTeachers } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { mockEventBooking, mockEventBookings } from "../../../../../mocks/data";

describe("countStudentsAndTeachers", () => {
  it("returns an object with studentCount and teacherCount both set to 0 when passed an empty array", () => {
    const result = countStudentsAndTeachers([]);
    expect(result).toEqual({ studentCount: 0, teacherCount: 0 });
  });

  it("should return the correct count of students and teachers when passed an array of Event Bookings", () => {
    const result = countStudentsAndTeachers(mockEventBookings);
    expect(result).toEqual({ studentCount: 3, teacherCount: 2 });
  });

  it("should not count other user roles", () => {
    const results = countStudentsAndTeachers([
      ...mockEventBookings,
      {
        ...mockEventBooking,
        bookingStatus: "CONFIRMED",
        userBooked: { ...mockEventBooking.userBooked, role: "EVENT_LEADER" },
      },
    ]);
    expect(results).toEqual({ studentCount: 3, teacherCount: 2 });
  });

  it("should not count bookings with invalid bookingStatus", () => {
    const cancelledBooking: EventBookingDTO = { ...mockEventBooking, bookingStatus: "CANCELLED" };
    const results = countStudentsAndTeachers([...mockEventBookings, cancelledBooking]);
    expect(results).toEqual({ studentCount: 3, teacherCount: 2 });
  });
});
