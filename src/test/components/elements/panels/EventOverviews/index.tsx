import { EventOverviews } from "../../../../../app/components/elements/panels/EventOverviews";
import { TestUserRole, renderTestEnvironment } from "../../../../utils";
import { screen, within } from "@testing-library/react";
import { mockUser, mockFutureEventOverviews, mockPastEventOverviews } from "../../../../../mocks/data";
import { rest } from "msw";
import { API_PATH } from "../../../../../app/services";
import userEvent from "@testing-library/user-event";

const getFirstEventDetails = () => {
  const table = screen.getByRole("table");
  const rows = screen.getAllByRole("row", table);
  const eventRow = rows[1];
  const tableCells = within(eventRow).getAllByRole("cell");
  return { eventRow, tableCells };
};

const getExpectedValues = ({
  event,
  type,
}: {
  event: (typeof mockFutureEventOverviews.results)[0];
  type: "Past" | "Future";
}) => {
  switch (type) {
    case "Past":
      return [
        "Manage",
        `${event.title} - ${event.subtitle}`,
        "Tue, 12 Sept 2023, 16:30",
        "Mon, 11 Sept 2023, 16:30",
        event.location?.address?.town,
        event.eventStatus,
        `${event.numberOfConfirmedBookings} / ${event.numberOfPlaces}`,
        event.numberOfWaitingListBookings,
        event.numberAttended,
        event.numberAbsent,
        `${(event.numberAttended / (event.numberAttended + event.numberAbsent)) * 100}%`,
      ];
    case "Future":
    default:
      return [
        "Manage",
        `${event.title} - ${event.subtitle}`,
        "Thu, 9 Sept 9999, 20:00",
        "Thu, 9 Sept 9999, 20:00",
        event.location?.address?.town,
        event.eventStatus,
        `${event.numberOfConfirmedBookings} / ${event.numberOfPlaces}`,
        event.numberOfWaitingListBookings,
        event.numberAttended,
        event.numberAbsent,
        "-",
      ];
  }
};

describe("Admin Event Manager", () => {
  const mockSetSelectedEventId = jest.fn();

  const setupTest = (role: TestUserRole) => {
    renderTestEnvironment({
      role: role,
      PageComponent: EventOverviews,
      componentProps: {
        setSelectedEventId: mockSetSelectedEventId,
        user: { ...mockUser, loggedIn: true, role: role },
      },
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
      ],
    });
  };

  it("renders for Admin user without crashing", () => {
    setupTest("ADMIN");
    const subtitle = screen.getByText("Events overview");
    expect(subtitle).toBeInTheDocument();
  });

  it("renders warning for Event Leader user", () => {
    setupTest("EVENT_LEADER");
    const eventLeaderWarning = screen.getByText(
      "As an event leader, you are only able to see the details of events which you manage.",
    );
    expect(eventLeaderWarning).toBeInTheDocument();
  });

  it("displays table with correct headers", async () => {
    const headers = [
      "Actions",
      "Title",
      "Date",
      "Booking deadline",
      "Location",
      "Status",
      "Number confirmed",
      "Number waiting",
      "Number attended",
      "Number absent",
      "Attendance",
    ];
    setupTest("ADMIN");
    await screen.findByText("Actions");
    headers.forEach((header) => {
      expect(
        screen.getByRole("columnheader", {
          name: header,
        }),
      ).toBeInTheDocument();
    });
  });

  it("displays correct number of 'future' events", async () => {
    setupTest("ADMIN");
    await screen.findByText("Actions");
    const table = screen.getByRole("table");
    const rows = screen.getAllByRole("row", table);
    expect(rows).toHaveLength(2);
    const futureEvent = screen.getByText(
      `${mockFutureEventOverviews.results[0].title} - ${mockFutureEventOverviews.results[0].subtitle}`,
    );
    expect(futureEvent).toBeInTheDocument();
  });

  it("clicking on Past Events filter will change table content and display correct number of 'past' events", async () => {
    setupTest("ADMIN");
    await screen.findByText("Actions");
    const filterSelection = screen.getByRole("combobox");
    await userEvent.selectOptions(filterSelection, ["PAST"]);
    const pastEvent = await screen.findByText(
      `${mockPastEventOverviews.results[0].title} - ${mockPastEventOverviews.results[0].subtitle}`,
    );
    expect(pastEvent).toBeInTheDocument();
    const table = screen.getByRole("table");
    const rows = screen.getAllByRole("row", table);
    expect(rows).toHaveLength(2);
  });

  it("correct details appear in each column for future events", async () => {
    setupTest("ADMIN");
    await screen.findByText("Actions");
    const event = mockFutureEventOverviews.results[0];
    const { tableCells } = getFirstEventDetails();
    const expectedValues = getExpectedValues({ event, type: "Future" });
    tableCells.forEach((cell) => {
      const expectedValue = expectedValues.shift() as string;
      expect(cell).toHaveTextContent(expectedValue);
    });
  });

  it("correct details appear in each column for past events", async () => {
    setupTest("ADMIN");
    await screen.findByText("Actions");
    const event = mockPastEventOverviews.results[0];
    const filterSelection = screen.getByRole("combobox");
    await userEvent.selectOptions(filterSelection, ["PAST"]);
    const expectedValues = getExpectedValues({ event, type: "Past" });
    const { tableCells } = getFirstEventDetails();
    tableCells.forEach((cell) => {
      const expectedValue = expectedValues.shift() as string;
      expect(cell).toHaveTextContent(expectedValue);
    });
  });

  it("pressing 'Manage' button on an event will correctly attempt to set the EventId", async () => {
    setupTest("ADMIN");
    await screen.findByText("Actions");
    const { eventRow } = getFirstEventDetails();
    const manageButton = within(eventRow).getByRole("button", {
      name: "Manage",
    });
    await userEvent.click(manageButton);
    expect(mockSetSelectedEventId).toHaveBeenCalledWith(mockFutureEventOverviews.results[0].id);
  });

  it("if no matching events are found, a message is displayed", async () => {
    renderTestEnvironment({
      role: "ADMIN",
      PageComponent: EventOverviews,
      componentProps: {
        setSelectedEventId: mockSetSelectedEventId,
        user: { ...mockUser, loggedIn: true, role: "ADMIN" },
      },
      initialRouteEntries: ["/admin/events"],
      extraEndpoints: [
        rest.get(API_PATH + "/events/overview", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ results: [], totalResults: 0 }));
        }),
      ],
    });
    const noEventsMessage = await screen.findByText("No events to display with this filter setting");
    expect(noEventsMessage).toBeInTheDocument();
  });
});
