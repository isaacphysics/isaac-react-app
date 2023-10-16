import { screen } from "@testing-library/react";
import {
  SelectedEventDetails,
  countStudentsAndTeachers,
  formatAddress,
} from "../../../../../app/components/elements/panels/SelectedEventDetails";
import {
  ACTION_TYPE,
  API_PATH,
  augmentEvent,
} from "../../../../../app/services";
import { renderTestEnvironment } from "../../../../utils";
import { mockEvent, mockEventBookings } from "../../../../../mocks/data";
import { AugmentedEvent } from "../../../../../IsaacAppTypes";
import {
  EventBookingDTO,
  IsaacEventPageDTO,
} from "../../../../../IsaacApiTypes";
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

  const findExpectedValues = (
    event: AugmentedEvent,
    eventBookings: EventBookingDTO[]
  ) => {
    const title = `${event.title as string} ${event.subtitle as string}`;
    const location = event.isVirtual ? "Online" : formatAddress(event.location);
    const status = event.eventStatus as string;
    const date = `${FRIENDLY_DATE_AND_TIME.format(
      event.date
    )} - ${FRIENDLY_DATE_AND_TIME.format(event.endDate)}`;
    const bookingDeadline = FRIENDLY_DATE_AND_TIME.format(
      event.bookingDeadline
    );
    const { studentCount, teacherCount } =
      countStudentsAndTeachers(eventBookings);
    const placesAvailable = `${event.placesAvailable} / ${event.numberOfPlaces}`;
    const numberOfStudents = `${studentCount} / ${event.numberOfPlaces}`;
    const numberOfTeachers = `${teacherCount} / ${event.numberOfPlaces}`;

    return [
      title,
      location,
      status,
      date,
      bookingDeadline,
      placesAvailable,
      numberOfStudents,
      numberOfTeachers,
    ];
  };

  it("renders all event details when event is selected", async () => {
    const eventDetails = mockEvent as IsaacEventPageDTO;
    const augmentedEvent = augmentEvent(eventDetails);
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const expectedValues = findExpectedValues(
      augmentedEvent,
      mockEventBookings
    );
    expectedValues.forEach((each) =>
      expect(eventInfo.textContent).toContain(each)
    );
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
    } as IsaacEventPageDTO;
    const augmentedEvent = augmentEvent(eventDetails);
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const location = findExpectedValues(augmentedEvent, mockEventBookings)[1];
    expect(eventInfo.textContent).toContain(location);
  });

  it("shows Prepwork deadline if present in the event details", async () => {
    const eventDetails = {
      ...mockEvent,
      prepWorkDeadline: 1695897589235 as unknown as Date,
    } as IsaacEventPageDTO;
    setupTest(eventDetails);
    const eventInfo = await screen.findByTestId("event-details");
    const prepWorkDeadline = FRIENDLY_DATE_AND_TIME.format(
      eventDetails.prepWorkDeadline
    );
    expect(eventInfo.textContent).toContain(prepWorkDeadline);
    expect(eventInfo.textContent).toContain("Prepwork deadline");
  });

  it("does not show Prepwork deadline if not present in the event details", async () => {
    setupTest(mockEvent as IsaacEventPageDTO);
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo.textContent).not.toContain("Prepwork deadline");
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
    const eventInfo = await screen.findByTestId("event-details");
    expect(eventInfo.textContent).toContain("Event details not found");
  });
});
