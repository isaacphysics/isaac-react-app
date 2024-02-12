import { rest } from "msw";
import { BookingStatus, EventBookingDTO, UserRole } from "../../../../IsaacApiTypes";
import { ManageExistingBookings } from "../../../../app/components/elements/panels/ManageExistingBookings";
import { renderTestEnvironment } from "../../../utils";
import { API_PATH } from "../../../../app/services";
import { mockEvent, mockUser, mockEventBookings, mockEventBooking } from "../../../../mocks/data";
import { screen, within } from "@testing-library/react";
import { UserSchoolLookup } from "../../../../IsaacAppTypes";
import { FRIENDLY_DATE_AND_TIME } from "../../../../app/components/elements/DateString";

const mockEventBookingsForMockEvent: EventBookingDTO[] = mockEventBookings.map((booking) => ({
  ...booking,
  eventId: mockEvent.id,
  eventTitle: mockEvent.title,
  eventDate: mockEvent.date,
}));

const getTableAndFirstRow = async () => {
  const bookingsTable = await screen.findByRole("table");
  const tableRows = within(bookingsTable).getAllByRole("row");
  const firstBookingRow = tableRows[1];
  return { bookingsTable, firstBookingRow };
};

const getTableHeader = (table: HTMLElement) => within(table).getAllByRole("columnheader");

const expectTableHeaders = (table: HTMLElement, expectedHeaders: string[]) => {
  const tableHeader = getTableHeader(table);
  expect(tableHeader).toHaveLength(expectedHeaders.length);
  tableHeader.forEach((header, index) => expect(header).toHaveTextContent(expectedHeaders[index]));
};

const getTableRowCells = (row: HTMLElement) => within(row).getAllByRole("cell");

const expectRowData = (row: HTMLElement, expectedData: string[]) => {
  const rowCells = getTableRowCells(row);
  expect(rowCells).toHaveLength(expectedData.length + 1);
  rowCells.slice(1).forEach((cell, index) => expect(cell).toHaveTextContent(expectedData[index]));
};

const getActionButton = async (firstBookingRow: HTMLElement, buttonName: string) => {
  const firstBookingCells = within(firstBookingRow).getAllByRole("cell");
  const firstBookingActionsCell = firstBookingCells[0];
  return within(firstBookingActionsCell).queryByRole("button", { name: new RegExp(buttonName, "i") });
};

describe("ManageExistingBookings", () => {
  const setupTest = (eventBookings: EventBookingDTO[], role: UserRole = "ADMIN") => {
    renderTestEnvironment({
      role: role,
      PageComponent: ManageExistingBookings,
      componentProps: {
        user: { ...mockUser, loggedIn: true, role: role },
        eventBookingId: mockEvent.id,
      },
      initialRouteEntries: ["/admin/events/"],
      extraEndpoints: [
        rest.get(API_PATH + `/events/${mockEvent.id}/bookings`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(eventBookings));
        }),
        rest.get(API_PATH + `/users/school_lookup`, (req, res, ctx) => {
          const mockSchoolData: UserSchoolLookup = {
            ["200"]: {
              urn: "123456",
              name: "Mock School",
              postcode: "ABC 123",
              closed: false,
              dataSource: "GOVERNMENT_UK",
            },
          };
          return res(ctx.status(200), ctx.json(mockSchoolData));
        }),
      ],
    });
  };

  it("renders table of bookings with correct headers, if bookings are found for an event", async () => {
    setupTest(mockEventBookingsForMockEvent);
    expect(screen.getByText("Manage current bookings")).toBeInTheDocument();
    const { bookingsTable } = await getTableAndFirstRow();
    const expectedColumnHeaders = [
      "Actions",
      "Name",
      "Email",
      "Account type",
      "School",
      "Job / Year Group",
      "Booking status",
      "Gender",
      "Booking created",
      "Booking updated",
      "Stage",
      "Exam board",
      "Reserved by ID",
      "Accessibility requirements",
      "Dietary requirements",
      "Emergency name",
      "Emergency telephone",
    ];
    expectTableHeaders(bookingsTable, expectedColumnHeaders);
  });

  it("populates expected data in first table row, if bookings are found for an event", async () => {
    setupTest(mockEventBookingsForMockEvent);
    const { firstBookingRow } = await getTableAndFirstRow();
    const expectedFirstBookingData = [
      "Teacher, Test",
      "test_teacher@test.com",
      "TEACHER",
      "Mock School",
      "Teacher of Computer Science",
      "CONFIRMED",
      "FEMALE",
      FRIENDLY_DATE_AND_TIME.format(new Date(mockEventBookingsForMockEvent[0].bookingDate!)),
      FRIENDLY_DATE_AND_TIME.format(new Date(mockEventBookingsForMockEvent[0].updated!)),
      "All stages",
      "OCR",
      "-",
      "",
      "",
      "",
      "",
    ];
    expectRowData(firstBookingRow, expectedFirstBookingData);
  });

  it("displays a message if no bookings are found for the event being checked", async () => {
    setupTest([]);
    expect(screen.getByText("Manage current bookings")).toBeInTheDocument();
    const noEventsMessage = await screen.findByText(/There aren't currently any bookings for this event/i);
    expect(noEventsMessage).toBeInTheDocument();
  });

  it("displays action buttons for each booking", async () => {
    setupTest(mockEventBookingsForMockEvent);
    const { firstBookingRow } = await getTableAndFirstRow();
    const firstBookingCells = within(firstBookingRow).getAllByRole("cell");
    const firstBookingActionsCell = firstBookingCells[0];
    const actionButtons = within(firstBookingActionsCell).getAllByRole("button");
    expect(actionButtons).not.toHaveLength(0);
  });

  const deleteButtonTestCases = [
    { role: "ADMIN" as UserRole, description: "offers", expected: true },
    { role: "EVENT_LEADER" as UserRole, description: "does not offer", expected: false },
    { role: "EVENT_MANAGER" as UserRole, description: "does not offer", expected: false },
  ];

  it.each(deleteButtonTestCases)("$description delete button for $role", async ({ role, expected }) => {
    setupTest(mockEventBookingsForMockEvent, role);
    const { firstBookingRow } = await getTableAndFirstRow();
    const deleteButton = await getActionButton(firstBookingRow, "delete");
    if (expected) {
      expect(deleteButton).toBeInTheDocument();
    } else {
      expect(deleteButton).toBeNull();
    }
  });

  const buttonTestCases = [
    { buttonName: "promote", status: "WAITING_LIST" as BookingStatus },
    { buttonName: "promote", status: "CANCELLED" as BookingStatus },
    { buttonName: "cancel", status: "WAITING_LIST" as BookingStatus },
    { buttonName: "cancel", status: "CONFIRMED" as BookingStatus },
    { buttonName: "resend email", status: "WAITING_LIST" as BookingStatus },
    { buttonName: "resend email", status: "CONFIRMED" as BookingStatus },
    { buttonName: "resend email", status: "CANCELLED" as BookingStatus },
    { buttonName: "resend email", status: "ATTENDED" as BookingStatus },
    { buttonName: "resend email", status: "ABSENT" as BookingStatus },
    { buttonName: "resend email", status: "RESERVED" as BookingStatus },
  ];
  it.each(buttonTestCases)(`offers $buttonName if booking status is $status`, async ({ buttonName, status }) => {
    const modifiedBooking = { ...mockEventBooking, bookingStatus: status };
    setupTest([modifiedBooking]);
    const { firstBookingRow } = await getTableAndFirstRow();
    const button = await getActionButton(firstBookingRow, buttonName);
    expect(button).toBeInTheDocument();
  });
});
