import { rest } from "msw";
import { EventManager } from "../../app/components/pages/EventManager";
import { checkPageTitle, renderTestEnvironment } from "../utils";
import { API_PATH } from "../../app/services";
import { mockFutureEventOverviews, mockUser } from "../../mocks/data";
import { screen, within } from "@testing-library/react";
import { Role } from "../../IsaacApiTypes";

describe("Event Manager", () => {
  const renderEventManager = ({ role = "EVENT_MANAGER" }: { role?: Role } = {}) => {
    renderTestEnvironment({
      role: role,
      PageComponent: EventManager,
      initialRouteEntries: ["/admin/events"],
      extraEndpoints: [
        rest.get(API_PATH + "/events/overview", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockFutureEventOverviews));
        }),
      ],
      componentProps: { user: { ...mockUser, role: role } },
    });
  };

  it("event booking admin page renders with events", async () => {
    renderEventManager();
    checkPageTitle("Event booking admin");
    const eventOverviews = screen.getByText(/events overview/i);
    expect(eventOverviews).toBeInTheDocument();
    const eventsTable = await screen.findByRole("table");
    const tableCells = within(eventsTable).getAllByRole("cell");
    expect(tableCells[1]).toHaveTextContent(
      `${mockFutureEventOverviews.results[0].title} - ${mockFutureEventOverviews.results[0].subtitle}`,
    );
  });

  it("shows event listing form and events toolkit buttons with correct links", () => {
    renderEventManager();
    const eventListingForm = screen.getByRole("link", { name: /event listing form/i });
    const eventsToolkit = screen.getByRole("link", { name: /events toolkit/i });
    expect(eventListingForm).toHaveAttribute("href", "https://forms.office.com/e/ZrijWx8gcw");
    expect(eventsToolkit).toHaveAttribute(
      "href",
      "https://myscience.atlassian.net/wiki/spaces/NN/pages/4119658517/Events+toolkit",
    );
  });

  it("if logged in as an Event Leader, a message appears to warn that they can only view events they manage", () => {
    renderEventManager({ role: "EVENT_LEADER" });
    checkPageTitle("Event booking admin");
    const warningMessage = /as an event leader, you are only able to see the details of events which you manage/i;
    const warningElement = screen.getByText(warningMessage);
    expect(warningElement).toBeInTheDocument();
  });
});
