import { screen } from "@testing-library/react";
import { SelectedEventDetails } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { ACTION_TYPE, API_PATH, augmentEvent } from "../../../../../app/services";
import { renderTestEnvironment } from "../../../../utils";
import { mockEvent, mockEventBookings } from "../../../../../mocks/data";
import { IsaacEventPageDTO } from "../../../../../IsaacApiTypes";
import { FRIENDLY_DATE_AND_TIME } from "../../../../../app/components/elements/DateString";
import { store } from "../../../../../app/state";
import { rest } from "msw";

describe("SelectedEventDetails", () => {
  const setupTest = (eventPage: IsaacEventPageDTO) => {
    renderTestEnvironment({
      PageComponent: SelectedEventDetails,
      componentProps: {
        eventId: mockEvent.id,
      },
      initialRouteEntries: ["/admin/events/"],
      extraEndpoints: [
        rest.get(API_PATH + `/events/${mockEvent.id}`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(eventPage));
        }),
      ],
    });
    store.dispatch({
      type: ACTION_TYPE.EVENT_BOOKINGS_RESPONSE_SUCCESS,
      eventBookings: mockEventBookings,
    });
  };

  it("renders all event details when event is selected", async () => {
    const eventDetails = mockEvent;
    const augmentedEvent = augmentEvent(eventDetails);
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const expectedValues = [
      "Example Event - Example Subtitle",
      "Online",
      "OPEN",
      `${FRIENDLY_DATE_AND_TIME.format(augmentedEvent.date)} - ${FRIENDLY_DATE_AND_TIME.format(
        augmentedEvent.endDate,
      )}`,
      FRIENDLY_DATE_AND_TIME.format(augmentedEvent.bookingDeadline),
      "195 / 200",
      "3 / 200",
      "2 / 200",
      "1 (33%)",
      "0 (0%)",
      "1 (33%)",
      "0 (0%)",
      "1 (33%)",
      "0 (0%)",
      "1 (50%)",
      "0 (0%)",
      "1 (50%)",
      "0 (0%)",
    ];
    expectedValues.forEach((each) => expect(eventInfo).toHaveTextContent(each));
    const title = screen.getByText("Selected event details");
    expect(title).toBeInTheDocument();
  });

  it("renders address if event is not virtual, and address is provided", async () => {
    const eventDetails = {
      ...mockEvent,
      tags: ["student", "booster"],
      location: {
        address: {
          addressLine1: "Fake Street",
          town: "Fake Town",
          postalCode: "FAKE 123",
        },
      },
    };
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const location = "Fake Street, Fake Town, FAKE 123";
    expect(eventInfo).toHaveTextContent(location);
  });

  it("shows Prepwork deadline if present in the event details", async () => {
    const eventDetails = {
      ...mockEvent,
      prepWorkDeadline: 1695897589235,
    };
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const prepWorkDeadline = FRIENDLY_DATE_AND_TIME.format(eventDetails.prepWorkDeadline);
    expect(eventInfo).toHaveTextContent(prepWorkDeadline);
    expect(eventInfo).toHaveTextContent("Prepwork deadline");
  });

  it("does not show Prepwork deadline if not present in the event details", async () => {
    setupTest(mockEvent);
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo).not.toHaveTextContent("Prepwork deadline");
  });

  it("shows private event badge if event is private", async () => {
    setupTest({ ...mockEvent, privateEvent: true });
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo).toHaveTextContent("Private Event");
  });

  it("does not show private event badge if event is not private", async () => {
    setupTest(mockEvent);
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo).not.toHaveTextContent("Private Event");
  });

  it("does not show booking deadline if not present in the event details", async () => {
    setupTest({ ...mockEvent, bookingDeadline: undefined });
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo).not.toHaveTextContent("Booking deadline");
  });

  it("shows message if event details are not found", async () => {
    renderTestEnvironment({
      PageComponent: SelectedEventDetails,
      componentProps: {
        eventId: mockEvent.id,
      },
      initialRouteEntries: ["/admin/events/"],
      extraEndpoints: [
        rest.get(API_PATH + `/events/${mockEvent.id}`, (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({}));
        }),
      ],
    });
    const eventInfo = await screen.findByTestId("event-details-not-found");
    expect(eventInfo).toHaveTextContent("Event details not found.");
  });
});
