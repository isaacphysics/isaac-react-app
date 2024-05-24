import { screen } from "@testing-library/react";
import { renderTestEnvironment } from "../../../utils";
import { EventCard } from "../../../../app/components/elements/cards/EventCard";
import { mockEvent } from "../../../../mocks/data";
import { augmentEvent } from "../../../../app/services";
import { FRIENDLY_DATE } from "../../../../app/components/elements/DateString";
import { BookingStatus, EventStatus } from "../../../../IsaacApiTypes";

const joinEventButton = () => screen.queryByRole("link", { name: "Join event now" });

describe("EventCard", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: EventCard,
      componentProps: {
        ...props,
      },
      initialRouteEntries: ["/"],
    });
  };

  const mockAugmentedEvent = augmentEvent(mockEvent);

  it("renders without crashing", () => {
    setupTest({ event: mockAugmentedEvent });
    const viewDetails = screen.getByTestId("event-card-details");
    expect(viewDetails).toBeInTheDocument();
  });

  it("displays title, subtitle, date, image if provided", () => {
    setupTest({ event: mockAugmentedEvent });
    const title = screen.getByTestId("event-card-title");
    const subtitle = screen.getByTestId("event-card-subtitle");
    const dateText = screen.getByTestId("event-card-date");
    const image = screen.getByTestId("event-card-image");
    expect(title).toHaveTextContent(new RegExp(mockEvent.title!, "i"));
    expect(subtitle).toHaveTextContent(mockEvent.subtitle!);
    expect(dateText).toHaveTextContent(new RegExp(FRIENDLY_DATE.format(mockEvent.date), "i"));
    expect(image).toHaveAttribute("src", mockEvent.eventThumbnail!.src);
  });

  it("does not display title, subtitle, date, image if not provided", () => {
    setupTest({
      event: {
        ...mockAugmentedEvent,
        title: undefined,
        subtitle: undefined,
        date: undefined,
        eventThumbnail: undefined,
      },
    });
    const title = screen.queryByTestId("event-card-title");
    const subtitle = screen.queryByTestId("event-card-subtitle");
    const dateText = screen.queryByTestId("event-card-date");
    const image = screen.queryByTestId("event-card-image");
    [title, subtitle, dateText, image].forEach((element) => {
      expect(element).not.toBeInTheDocument();
    });
  });

  const eventStatuses = [
    { badge: "FULL", status: "Full", options: { placesAvailable: 0 } },
    {
      badge: "CANCELLED",
      status: "Cancelled",
      options: { eventStatus: "CANCELLED" as EventStatus },
    },
    {
      badge: "PRIVATE",
      status: "Private Event",
      options: { privateEvent: true },
    },
  ];

  eventStatuses.forEach(({ status, badge, options }) => {
    it(`displays '${badge}' badge if event is ${status}`, () => {
      const event = augmentEvent({
        ...mockEvent,
        ...options,
      });
      setupTest({ event });
      const badgeElement = screen.getByText(status);
      expect(badgeElement).toBeInTheDocument();
    });
  });

  it("does not display 'Full', 'Cancelled' or 'Private Event' badges if event is not full, cancelled or private", () => {
    setupTest({ event: mockAugmentedEvent });
    const fullBadge = screen.queryByText("Full");
    const cancelledBadge = screen.queryByText("Cancelled");
    const privateBadge = screen.queryByText("Private Event");
    [fullBadge, cancelledBadge, privateBadge].forEach((each) => {
      expect(each).not.toBeInTheDocument();
    });
  });

  it("displays 'Online' if event is virtual", () => {
    setupTest({ event: { ...mockAugmentedEvent, isVirtual: true } });
    const location = screen.getByTestId("event-card-location");
    expect(location).toHaveTextContent("Online");
  });

  it("displays location if event is not virtual and address was provided", () => {
    const location = {
      address: {
        addressLine1: "123 Fake Street",
        town: "Fake Town",
      },
    };
    const event = augmentEvent({
      ...mockEvent,
      tags: ["student", "booster"],
      location: location,
    });
    setupTest({ event });
    const eventLocation = screen.getByTestId("event-card-location");
    expect(eventLocation).toHaveTextContent(`${location.address.addressLine1}, ${location.address.town}`);
  });

  it("hides the 'Location' section if event is not virtual and no address was provided", () => {
    const event = augmentEvent({
      ...mockEvent,
      tags: ["student", "booster"],
      location: undefined,
    });
    setupTest({ event });
    const eventLocation = screen.queryByTestId("event-card-location");
    expect(eventLocation).not.toBeInTheDocument();
  });

  it("displays 'View Details' link with correct url", () => {
    setupTest({ event: mockAugmentedEvent });
    const viewDetails = screen.getByTestId("event-card-details");
    const viewDetailsLink = viewDetails.querySelector("a");
    expect(viewDetailsLink).toHaveAttribute("href", `/events/${mockEvent.id}`);
  });

  it("does not offer a 'join event now' button if user is not logged in", async () => {
    const event = augmentEvent({
      ...mockEvent,
      meetingUrl: "https://example-meeting-link.com",
    });
    setupTest({ role: "ANONYMOUS", event });
    const title = await screen.findByTestId("event-card-title");
    expect(title).toBeInTheDocument();
    expect(joinEventButton()).toBeNull();
  });

  it("does not offer a 'join event now' button if user is not booked on the event", async () => {
    const event = augmentEvent({
      ...mockEvent,
      meetingUrl: "https://example-meeting-link.com",
    });
    setupTest({ role: "STUDENT", event });
    const title = await screen.findByTestId("event-card-title");
    expect(title).toBeInTheDocument();
    expect(joinEventButton()).toBeNull();
  });

  it.each(["RESERVED", "CANCELLED", "WAITING_LIST", "ATTENDED", "ABSENT"] as BookingStatus[])(
    "does not offer a 'join event now' button if user's booking status is %s",
    async (bookingStatus) => {
      const event = augmentEvent({
        ...mockEvent,
        meetingUrl: "https://example-meeting-link.com",
        userBookingStatus: bookingStatus,
      });
      setupTest({ role: "STUDENT", event });
      const title = await screen.findByTestId("event-card-title");
      expect(title).toBeInTheDocument();
      const joinEventButton = screen.queryByRole("link", { name: "Join event now" });
      expect(joinEventButton).toBeNull();
    },
  );

  it("does not offer a 'join event now' button if a meetingUrl is not provided", async () => {
    const event = augmentEvent({
      ...mockEvent,
      userBookingStatus: "CONFIRMED",
    });
    setupTest({ role: "STUDENT", event });
    const title = await screen.findByTestId("event-card-title");
    expect(title).toBeInTheDocument();
    expect(joinEventButton()).toBeNull();
  });

  it("offers a 'join event now' button if a meetingUrl is provided and user's booking status is CONFIRMED", async () => {
    const event = augmentEvent({
      ...mockEvent,
      meetingUrl: "https://example-meeting-link.com",
      userBookingStatus: "CONFIRMED",
    });
    setupTest({ role: "STUDENT", event });
    const title = await screen.findByTestId("event-card-title");
    expect(title).toBeInTheDocument();
    expect(joinEventButton()).toBeInTheDocument();
    expect(joinEventButton()).toHaveAttribute("href", event.meetingUrl);
  });
});
