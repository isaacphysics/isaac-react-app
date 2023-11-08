import { countStudentsAndTeachers } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { mockCancelledEventBooking, mockEventBookings } from "../../../../../mocks/data";

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
        userBooked: {
          givenName: "Test",
          familyName: "Event Leader",
          role: "EVENT_LEADER",
          authorisedFullAccess: false,
          emailVerificationStatus: "VERIFIED",
          teacherPending: false,
          registeredContexts: [
            {
              stage: "all",
              examBoard: "ocr",
            },
          ],
          email: "test_eventleader@test.com",
          id: 300,
        },
        eventId: "example_event",
        eventTitle: "Example Event",
        bookingStatus: "CONFIRMED",
      },
    ]);
    expect(results).toEqual({ studentCount: 3, teacherCount: 2 });
  });

  it("should not count bookings with invalid bookingStatus", () => {
    const results = countStudentsAndTeachers([...mockEventBookings, mockCancelledEventBooking]);
    expect(results).toEqual({ studentCount: 3, teacherCount: 2 });
  });
});
