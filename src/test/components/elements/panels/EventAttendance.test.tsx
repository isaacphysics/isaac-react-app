import { rest } from "msw";
import { Role, BookingStatus, DetailedEventBookingDTO } from "../../../../IsaacApiTypes";
import { EventManager } from "../../../../app/components/pages/EventManager";
import { API_PATH } from "../../../../app/services";
import { renderTestEnvironment } from "../../../utils";
import { mockEventBookings, mockFutureEventOverviews, mockPastEventOverviews, mockUser } from "../../../../mocks/data";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ATTENDANCE, School, UserSchoolLookup } from "../../../../IsaacAppTypes";
import { FRIENDLY_DATE_AND_TIME } from "../../../../app/components/elements/DateString";
import * as actions from "../../../../app/state/actions";

const findAttendanceSection = async () => {
  const eventAttendanceAccordion = await screen.findByText("Record event attendance");
  await userEvent.click(eventAttendanceAccordion);
  const recordAttendanceControls = screen.getByTestId("record-attendance-controls");
  const attendanceTable = screen.getByTestId("record-attendance-table");
  return { recordAttendanceControls, attendanceTable };
};

describe("EventAttendance", () => {
  const setupTest = async (role?: Role, bookings?: DetailedEventBookingDTO[]) => {
    renderTestEnvironment({
      role: role ?? "EVENT_MANAGER",
      PageComponent: EventManager,
      initialRouteEntries: ["/admin/events"],
      extraEndpoints: [
        rest.get(API_PATH + "/events/overview", (req, res, ctx) => {
          const filter = req.url.searchParams.get("filter");
          if (filter === "FUTURE") {
            return res(ctx.status(200), ctx.json(mockFutureEventOverviews));
          } else if (filter === "PAST") {
            return res(ctx.status(200), ctx.json(mockPastEventOverviews));
          }
        }),
        rest.get(API_PATH + `/events/${mockPastEventOverviews.results[0].id}`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockPastEventOverviews.results[0]));
        }),
        rest.get(API_PATH + `/events/${mockPastEventOverviews.results[0].id}/bookings`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(bookings ?? mockEventBookings));
        }),
        rest.get(API_PATH + `/users/school_lookup`, (req, res, ctx) => {
          const mockSchool: School = {
            urn: "123456",
            name: "Mock School",
            postcode: "ABC 123",
            closed: false,
            dataSource: "GOVERNMENT_UK",
          };
          const mockSchoolData: UserSchoolLookup = mockEventBookings.reduce((acc, booking) => {
            const userId = booking.userBooked?.id;
            if (userId) {
              acc[userId] = mockSchool;
            }
            return acc;
          }, {} as UserSchoolLookup);
          return res(ctx.status(200), ctx.json(mockSchoolData));
        }),
        rest.post(
          API_PATH + `/events/${mockPastEventOverviews.results[0].id}/bookings/record_attendance`,
          (req, res, ctx) => {
            return res(ctx.status(200));
          },
        ),
      ],
      componentProps: { user: { ...mockUser, role: role, loggedIn: true } },
    });
    // Selecting past events, then clicking manage to trigger the attendance panel
    await userEvent.selectOptions(screen.getByRole("combobox"), "Past events");
    await screen.findByText(
      `${mockPastEventOverviews.results[0].title} - ${mockPastEventOverviews.results[0].subtitle}`,
    );
    const tableCells = screen.getAllByRole("cell");
    const manageEventButton = within(tableCells[0]).getByRole("button", { name: /manage/i });
    await userEvent.click(manageEventButton);
  };

  it("displays event attendance controls", async () => {
    await setupTest();
    const { recordAttendanceControls } = await findAttendanceSection();
    const userSelection = within(recordAttendanceControls).getByRole("heading", { name: "Selected (0)" });
    expect(userSelection).toBeInTheDocument();
    const markAttendanceButton = within(recordAttendanceControls).getByRole("button", { name: "Mark Attendance" });
    expect(markAttendanceButton).toBeInTheDocument();
    ["ATTENDED", "ABSENT"].forEach((button) => {
      expect(within(recordAttendanceControls).getByRole("button", { name: button, hidden: true })).toBeInTheDocument();
    });
  });

  it("displays event bookings with correct headers, and expected booking values", async () => {
    await setupTest();
    const { attendanceTable } = await findAttendanceSection();
    const tableRows = within(attendanceTable).getAllByRole("row");
    expect(tableRows).toHaveLength(mockEventBookings.length + 1);
    const tableHeaders = within(tableRows[0]).getAllByRole("columnheader");
    expect(tableHeaders).toHaveLength(9);
    const expectedHeaders = [
      "Select",
      "Attendance",
      "Name",
      "Job / year group",
      "School",
      "Account type",
      "Email",
      "Booking created",
      "Booking updated",
    ];
    tableHeaders.forEach((header, index) => {
      expect(header).toHaveTextContent(expectedHeaders[index]);
    });
    const firstBookingRow = within(tableRows[1]).getAllByRole("cell");
    const expectedValues = [
      "",
      "Student, Another",
      "12",
      "Mock School",
      "STUDENT",
      "another_student@test.com",
      FRIENDLY_DATE_AND_TIME.format(mockEventBookings[2].bookingDate),
      FRIENDLY_DATE_AND_TIME.format(mockEventBookings[2].updated),
    ];
    firstBookingRow.forEach((cell, index) => {
      if (index === 0) {
        const checkbox = within(cell).getByRole("checkbox");
        expect(checkbox).toBeInTheDocument();
      } else {
        expect(cell).toHaveTextContent(expectedValues[index - 1]);
      }
    });
  });

  it("selects all bookings and enables controls when the select all checkbox is used", async () => {
    await setupTest();
    const { recordAttendanceControls, attendanceTable } = await findAttendanceSection();
    ["ATTENDED", "ABSENT"].forEach((button) => {
      expect(within(recordAttendanceControls).getByRole("button", { name: button, hidden: true })).toBeDisabled();
    });
    const selectAllButton = screen.getByTestId("select-all-toggle");
    await userEvent.click(selectAllButton);
    const userSelectionCount = within(recordAttendanceControls).getByRole("heading", { name: "Selected (5)" });
    expect(userSelectionCount).toBeInTheDocument();
    ["ATTENDED", "ABSENT"].forEach((button) => {
      expect(within(recordAttendanceControls).getByRole("menuitem", { name: button, hidden: true })).not.toBeDisabled();
    });
    const tableRows = within(attendanceTable).getAllByRole("row");
    tableRows.slice(1).forEach((row) => {
      const checkbox = within(row).getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  const recordAttendanceSpy = jest.spyOn(actions, "recordEventAttendance");
  const getEventBookingSpy = jest.spyOn(actions, "getEventBookings");

  it.each(["ATTENDED", "ABSENT"])(
    "updates booking statuses when selecting a booking and marking %s",
    async (status) => {
      await setupTest();
      const { recordAttendanceControls, attendanceTable } = await findAttendanceSection();
      const tableRows = within(attendanceTable).getAllByRole("row");
      const firstThreeBookings = tableRows.splice(1, 3);
      firstThreeBookings.forEach(async (row) => {
        const checkbox = within(row).getByRole("checkbox");
        expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);
      });
      const userSelectionCount = await within(recordAttendanceControls).findByRole("heading", { name: "Selected (3)" });
      expect(userSelectionCount).toBeInTheDocument();
      const markAttendance = within(recordAttendanceControls).getByRole("menuitem", { name: status, hidden: true });
      await act(() => userEvent.click(markAttendance));
      expect(recordAttendanceSpy).toHaveBeenCalledTimes(1);
      expect(recordAttendanceSpy).toHaveBeenCalledWith(
        mockPastEventOverviews.results[0].id,
        [202, 201, 200],
        ATTENDANCE[status as keyof typeof ATTENDANCE],
      );
      expect(getEventBookingSpy).toHaveBeenCalledTimes(2);
    },
  );

  it("displays a warning for event leaders", async () => {
    await setupTest("EVENT_LEADER");
    const warning = screen.getByText(/only able to see the details of events which you manage/i);
    expect(warning).toBeInTheDocument();
  });

  it("does not display the attendance accordion if there are no event bookings", async () => {
    await setupTest("EVENT_MANAGER", []);
    const eventAttendanceAccordion = screen.queryByText("Record event attendance");
    expect(eventAttendanceAccordion).not.toBeInTheDocument();
  });

  const bookingStatuses: BookingStatus[] = ["CONFIRMED", "ATTENDED", "ABSENT"];

  it.each(bookingStatuses)("shows appropriate symbol based on event attendance status %s", async (bookingStatus) => {
    const modifiedBookings = mockEventBookings.map((booking) => ({
      ...booking,
      bookingStatus,
    }));
    await setupTest("EVENT_MANAGER", modifiedBookings);
    const { attendanceTable } = await findAttendanceSection();
    const tableRows = within(attendanceTable).getAllByRole("row");
    const firstBooking = tableRows[1];
    const attendanceStatus = within(firstBooking).getAllByRole("cell")[1];
    const expectedSymbol = (bookingStatus: BookingStatus) => {
      switch (bookingStatus) {
        case "ATTENDED":
          return "✔️";
        case "ABSENT":
          return "❌";
        default:
          return "";
      }
    };
    expect(attendanceStatus).toHaveTextContent(expectedSymbol(bookingStatus));
  });

  it("shows a 'select remaining' button that selects all bookings that are not marked as attended or absent", async () => {
    const confirmedBookings = mockEventBookings.map((booking) => ({
      ...booking,
      bookingStatus: "CONFIRMED" as BookingStatus,
    }));
    const oneBookingAlreadyAttended = [
      { ...confirmedBookings[0], bookingStatus: "ATTENDED" as BookingStatus },
      ...confirmedBookings.slice(1),
    ];
    await setupTest("EVENT_MANAGER", oneBookingAlreadyAttended);
    const { attendanceTable, recordAttendanceControls } = await findAttendanceSection();
    const tableRows = within(attendanceTable).getAllByRole("row");
    expect(tableRows.length).toBe(6);
    const numberOfAttendedBookings = tableRows
      .slice(1)
      .map((row) => within(row).getAllByRole("cell")[1])
      .filter((each) => each.textContent === "✔️").length;
    expect(numberOfAttendedBookings).toBe(1);
    const selectRemainingButton = within(recordAttendanceControls).getByRole("button", { name: /select remaining/i });
    await waitFor(() => userEvent.click(selectRemainingButton));
    const bookingsWithoutAttendanceMarked = tableRows.slice(1).filter((row) => {
      const cellContent = within(row).getAllByRole("cell")[1].textContent;
      return cellContent === "";
    });
    bookingsWithoutAttendanceMarked.forEach((row) => {
      const checkbox = within(row).getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  it("shows only confirmed, attended and absent bookings in the attendance panel", async () => {
    const mockBookings = [
      { ...mockEventBookings[0], bookingStatus: "RESERVED" as BookingStatus },
      { ...mockEventBookings[1], bookingStatus: "CANCELLED" as BookingStatus },
      { ...mockEventBookings[2], bookingStatus: "CONFIRMED" as BookingStatus },
      { ...mockEventBookings[3], bookingStatus: "ATTENDED" as BookingStatus },
      { ...mockEventBookings[4], bookingStatus: "ABSENT" as BookingStatus },
      {
        ...mockEventBookings[4],
        bookingId: 1005,
        bookingStatus: "WAITING_LIST" as BookingStatus,
        userBooked: { ...mockEventBookings[4].userBooked, id: 305 },
      },
      {
        ...mockEventBookings[4],
        bookingId: 1006,
        bookingStatus: "CONFIRMED" as BookingStatus,
        userBooked: { ...mockEventBookings[4].userBooked, id: 305 },
      },
      {
        ...mockEventBookings[4],
        bookingId: 1007,
        bookingStatus: "CONFIRMED" as BookingStatus,
        userBooked: { ...mockEventBookings[4].userBooked, id: 306 },
      },
    ];
    await setupTest("EVENT_MANAGER", mockBookings);
    const { attendanceTable } = await findAttendanceSection();
    const tableRows = within(attendanceTable).getAllByRole("row");
    expect(tableRows.length).toBe(6);
    const getCellTextContent = (row: HTMLElement, cellIndex: number) =>
      within(row).getAllByRole("cell")[cellIndex].textContent;
    const rowCells = tableRows.slice(1).map((row) => getCellTextContent(row, 1));
    const numberOfAttendedBookings = rowCells.filter((text) => text === "✔️").length;
    const numberOfUnmarkedBookings = rowCells.filter((text) => text === "").length;
    const numberOfAbsentBookings = rowCells.filter((text) => text === "❌").length;
    expect(numberOfAbsentBookings).toBe(1);
    expect(numberOfAttendedBookings).toBe(1);
    expect(numberOfUnmarkedBookings).toBe(3);
  });
});
