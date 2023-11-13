import { TestUserRole, checkPageTitle, renderTestEnvironment } from "../utils";
import { mockEvent } from "../../mocks/data";
import { rest } from "msw";
import { API_PATH, formatAddress } from "../../app/services";
import { EventStatus, IsaacEventPageDTO, UserRole } from "../../IsaacApiTypes";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as eventServices from "../../app/services/events";
import { FRIENDLY_DATE_AND_TIME, TIME_ONLY } from "../../app/components/elements/DateString";

const getButton = (buttonText: string) => {
  const eventButton = screen.getByRole("button", { name: buttonText });
  return eventButton;
};

const image = () => screen.getByTestId("event-details-image");
const title = () => screen.getByTestId("event-details-title");
const map = () => screen.queryByTestId("event-map");
const location = () => screen.getByTestId("event-location");
const googleCalendarButton = () => screen.queryByText("Add to Calendar");
const eventDate = () => screen.getByTestId("event-date");
const placesAvailable = () => screen.queryByTestId("event-availability");
const privateBadge = () => screen.queryByText("Private Event");
const bookingDeadline = () => screen.queryByTestId("event-booking-deadline");

describe("EventDetails", () => {
  const setupTest = async ({ role, event }: { role: TestUserRole; event: IsaacEventPageDTO }) => {
    renderTestEnvironment({
      role: role,
      extraEndpoints: [
        rest.get(API_PATH + "/events", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ results: [event], totalResults: 0 }));
        }),
        rest.get(API_PATH + "/events/:eventId", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(event));
        }),
      ],
    });
    const eventCards = await screen.findAllByTestId("event-card");
    const eventCardViewDetails = within(eventCards[0]).getByText("View details");
    await userEvent.click(eventCardViewDetails);
  };

  it("renders without crashing", async () => {
    await setupTest({ role: "STUDENT", event: mockEvent });
    checkPageTitle(mockEvent.title!);
  });

  it("displays event title a second time with image, if image is defined", async () => {
    await setupTest({ role: "STUDENT", event: mockEvent });
    expect(title()).toBeInTheDocument();
    expect(image()).toHaveAttribute("src", mockEvent.eventThumbnail!.src);
  });

  it("uses a placeholder image if no image is specified", async () => {
    await setupTest({ role: "STUDENT", event: { ...mockEvent, eventThumbnail: undefined } });
    expect(image()).toHaveAttribute("src", "http://placehold.it/500x276");
  });

  it("shows a map and address details if location, latitude and longitude are specified, and event is not tagged as online", async () => {
    const mapLocation = {
      address: { addressLine1: "Mock street", town: "Mock town", postalCode: "ABC 123" },
      latitude: 53.95038292218263,
      longitude: -1.0510007751299424,
    };
    await setupTest({
      role: "STUDENT",
      event: { ...mockEvent, tags: ["booster", "student"], location: mapLocation },
    });
    expect(map()).toBeInTheDocument();
    expect(location()).toHaveTextContent(formatAddress(mapLocation));
  });

  it("shows location as online if event is tagged as virtual", async () => {
    await setupTest({ role: "STUDENT", event: { ...mockEvent, tags: ["virtual"] } });
    expect(location()).toHaveTextContent("Online");
  });

  it("shows private event badge if event is private", async () => {
    await setupTest({ role: "STUDENT", event: { ...mockEvent, privateEvent: true } });
    expect(privateBadge()).toBeVisible();
  });

  it("does not show private event badge if even is not private", async () => {
    await setupTest({ role: "STUDENT", event: { ...mockEvent, privateEvent: false } });
    expect(privateBadge()).not.toBeInTheDocument();
  });

  it.each(["ADMIN", "EVENT_MANAGER", "CONTENT_EDITOR"] as UserRole[])(
    "if user is %s, a google calendar button shows and can be clicked",
    async (role) => {
      const mockGoogleCalendarTemplate = jest.fn();
      jest.spyOn(eventServices, "googleCalendarTemplate").mockImplementation(mockGoogleCalendarTemplate);
      await setupTest({ role: role, event: mockEvent });
      const calendarButton = googleCalendarButton();
      expect(calendarButton).toBeVisible();
      await userEvent.click(calendarButton as HTMLElement);
      expect(mockGoogleCalendarTemplate).toHaveBeenCalled();
    },
  );

  it("if user is STUDENT, a google calendar button does not show", async () => {
    await setupTest({ role: "STUDENT", event: mockEvent });
    expect(googleCalendarButton()).not.toBeInTheDocument();
  });

  it("shows event date and time, and message if event was in the past", async () => {
    const startDate = new Date(new Date().setMonth(new Date().getMonth() - 2));
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const pastEvent = { ...mockEvent, date: startDate, endDate: endDate };
    await setupTest({
      role: "STUDENT",
      event: pastEvent,
    });
    const eventDateText = `${FRIENDLY_DATE_AND_TIME.format(startDate)} — ${TIME_ONLY.format(endDate)}`;
    const date = eventDate();
    expect(date).toHaveTextContent(eventDateText);
    expect(date).toHaveTextContent("This event is in the past.");
  });

  it("if event is in the future, no past event warning shows", async () => {
    const startDate = new Date(new Date().setMonth(new Date().getMonth() + 2));
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const futureEvent = { ...mockEvent, date: startDate, endDate: endDate };
    await setupTest({
      role: "STUDENT",
      event: futureEvent,
    });
    expect(eventDate()).not.toHaveTextContent("This event is in the past.");
  });

  it("if booking deadline has passed, message is shown", async () => {
    const date = new Date(new Date().setMonth(new Date().getMonth() - 2));
    const pastBookingDeadlineEvent = { ...mockEvent, bookingDeadline: date };
    await setupTest({
      role: "STUDENT",
      event: pastBookingDeadlineEvent,
    });
    const deadlineWarning = within(bookingDeadline() as HTMLElement).getByTestId("deadline-warning");
    expect(deadlineWarning).toHaveTextContent("The booking deadline for this event has passed.");
  });

  it("if no booking deadline is specified, no Booking Deadline section appears", async () => {
    const event = { ...mockEvent, bookingDeadline: undefined };
    await setupTest({
      role: "STUDENT",
      event: event,
    });
    expect(bookingDeadline()).not.toBeInTheDocument();
  });

  it("if event has available places, number of available spaces is shown, and `book a place` button is shown for logged in users", async () => {
    const event = { ...mockEvent, placesAvailable: 10 };
    await setupTest({ role: "STUDENT", event });
    expect(placesAvailable()).toHaveTextContent("10 spaces");
    expect(getButton("Book a place")).toBeInTheDocument();
  });

  it("if event has no available places, Full badge and `join waiting list` button is shown for logged in users", async () => {
    const event = { ...mockEvent, placesAvailable: 0 };
    await setupTest({ role: "STUDENT", event });
    expect(placesAvailable()).toHaveTextContent("Full");
    expect(getButton("Join waiting list")).toBeInTheDocument();
  });

  it("if event has no available places and is WAITING_LIST_ONLY, `request a place` button is shown for logged in users", async () => {
    const event = { ...mockEvent, placesAvailable: 0, eventStatus: "WAITING_LIST_ONLY" as EventStatus };
    await setupTest({ role: "STUDENT", event });
    expect(placesAvailable()).toHaveTextContent("Full");
    expect(getButton("Request a place")).toBeInTheDocument();
  });

  it("if event has no available places and user is RESERVED, `complete reservation` and `cancel registration` buttons are shown for logged in users", async () => {
    const event = {
      ...mockEvent,
      placesAvailable: 0,
      eventStatus: "WAITING_LIST_ONLY" as EventStatus,
      userBookingStatus: "RESERVED",
    };
    await setupTest({ role: "STUDENT", event });
    const availability = placesAvailable();
    expect(availability).toHaveTextContent("Full");
    expect(getButton("Cancel your reservation")).toBeInTheDocument();
    const confirmBookingButton = screen.getByRole("button", { name: /Complete your registration below/i });
    expect(availability).toContainElement(confirmBookingButton);
  });

  it("if not logged in and places available, `login to book` button is shown", async () => {
    const event = { ...mockEvent, placesAvailable: 10 };
    await setupTest({ role: "ANONYMOUS", event });
    expect(getButton("Login to book")).toBeInTheDocument();
  });

  it("if not logged in and no places available, `login to apply` button is shown", async () => {
    const event = { ...mockEvent, placesAvailable: 0 };
    await setupTest({ role: "ANONYMOUS", event });
    expect(getButton("Login to apply")).toBeInTheDocument();
  });

  it("if user is able to make reservations, `manage reservations` button is shown", async () => {
    const event = { ...mockEvent, placesAvailable: 10 };
    await setupTest({ role: "TEACHER", event });
    expect(getButton("Manage reservations")).toBeInTheDocument();
  });

  it("if user is already CONFIRMED on the event, `cancel booking` button is shown", async () => {
    const event = { ...mockEvent, placesAvailable: 10, userBookingStatus: "CONFIRMED" };
    await setupTest({ role: "STUDENT", event });
    expect(getButton("Cancel your booking")).toBeInTheDocument();
  });

  it("if user is already RESERVED on the event, `cancel reservation` button is shown", async () => {
    const event = { ...mockEvent, placesAvailable: 10, userBookingStatus: "RESERVED" };
    await setupTest({ role: "STUDENT", event });
    expect(getButton("Cancel your reservation")).toBeInTheDocument();
  });

  it("if user is already WAITING_LIST and event is WAITING_LIST_ONLY, `cancel booking request` button is shown", async () => {
    const event = {
      ...mockEvent,
      userBookingStatus: "WAITING_LIST",
      eventStatus: "WAITING_LIST_ONLY" as EventStatus,
    };
    await setupTest({ role: "STUDENT", event });
    expect(getButton("Cancel booking request")).toBeInTheDocument();
  });

  it("if user is already WAITING_LIST and event is not WAITING_LIST_ONLY, `leave waiting list` button is shown", async () => {
    const event = {
      ...mockEvent,
      userBookingStatus: "WAITING_LIST",
    };
    await setupTest({ role: "STUDENT", event });
    expect(getButton("Leave waiting list")).toBeInTheDocument();
  });
});
