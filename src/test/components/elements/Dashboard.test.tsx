import { mockNewsPods, mockPromoPods } from "../../../mocks/data";
import { Dashboard } from "../../../app/components/elements/Dashboard";
import { TestUserRole, renderTestEnvironment } from "../../utils";
import { screen, waitFor } from "@testing-library/react";

const mockPromoItem = mockPromoPods.results[0];
const mockFeaturedNewsItem = mockNewsPods.results[1];

describe("Dashboard", () => {
  const setupTest = (role: TestUserRole, props = {}) => {
    renderTestEnvironment({
      role: role,
      PageComponent: Dashboard,
      componentProps: {
        featuredNewsItem: mockFeaturedNewsItem,
        promoItem: mockPromoItem,
        ...props,
      },
      initialRouteEntries: ["/"],
    });
  };

  it("if no user is logged in, logged out content is shown", async () => {
    setupTest("ANONYMOUS");
    const loggedOutTitle = await screen.findByRole("heading", {
      name: /computer science learning/i,
    });
    expect(loggedOutTitle).toBeInTheDocument();
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    const promoTile = screen.queryByTestId("promo-tile");
    expect(featuredNewsTile).toBeNull();
    expect(promoTile).toBeNull();
  });

  it("if TEACHER user is logged in and promo item is available, the promo tile is visible, and featured news tile is not", async () => {
    setupTest("TEACHER");
    const promoTile = await screen.findByTestId("promo-tile");
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    expect(promoTile).toBeInTheDocument();
    expect(featuredNewsTile).toBeNull();
    const promoTitle = screen.getByText(mockPromoItem.title);
    expect(promoTitle).toBeInTheDocument();
  });

  it("if TEACHER user is logged in, but promo item is not available, featured news will appear instead", async () => {
    setupTest("TEACHER", {
      promoItem: null,
    });
    const featuredNewsTile = await screen.findByTestId("featured-news-item");
    const promoTile = screen.queryByTestId("promo-tile");
    expect(featuredNewsTile).toBeInTheDocument();
    expect(promoTile).toBeNull();
    const featuredNewsTitle = screen.getByText(mockFeaturedNewsItem.title);
    expect(featuredNewsTitle).toBeInTheDocument();
  });

  let roles: TestUserRole[] = [
    "STUDENT",
    "TUTOR",
    "EVENT_LEADER",
    "CONTENT_EDITOR",
    "EVENT_MANAGER",
    "ADMIN",
  ];

  it.each(roles)(
    "if %s user is logged in, featured news tile is displayed, and no promo",
    async (role) => {
      setupTest(role);
      const featuredNewsTile = await screen.findByTestId("featured-news-item");
      const promoTile = screen.queryByTestId("promo-tile");
      expect(featuredNewsTile).toBeInTheDocument();
      expect(promoTile).toBeNull();
      const featuredNewsTitle = screen.getByText(mockFeaturedNewsItem.title);
      expect(featuredNewsTitle).toBeInTheDocument();
    }
  );

  roles = [
    "STUDENT",
    "TEACHER",
    "TUTOR",
    "EVENT_LEADER",
    "CONTENT_EDITOR",
    "EVENT_MANAGER",
    "ADMIN",
  ];

  it.each(roles)(
    "if neither promo item nor featured news item are provided, loading spinner will appear for %s users",
    async (role) => {
      setupTest(role, {
        promoItem: null,
        featuredNewsItem: null,
      });
      const featuredNewsTile = await screen.findByTestId("featured-news-item");
      expect(featuredNewsTile).toBeInTheDocument();
      await waitFor(() => {
        const loadingMessage = screen.getByTestId("loading-spinner");
        expect(loadingMessage).toBeVisible();
      });
    }
  );
});
