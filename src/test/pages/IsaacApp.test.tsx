import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { reverse, zip } from "lodash";
import { UserRole, USER_ROLES } from "../../IsaacApiTypes";
import {
  renderTestEnvironment,
  NavBarMenus,
  NAV_BAR_MENU_TITLE,
} from "../utils";
import { FEATURED_NEWS_TAG, history } from "../../app/services";
import { mockNewsPods, mockPromoPods } from "../../mocks/data";

const myIsaacLinks = ["/assignments", "/my_gameboards", "/progress", "/tests"];
const tutorLinks = ["/groups", "/set_assignments", "/my_markbook"];
const teacherLinks = [
  "/groups",
  "/set_assignments",
  "/my_markbook",
  "/set_tests",
  "/teaching_order",
];
const learnLinks = [
  "/topics/gcse",
  "/topics/a_level",
  "/gameboards/new",
  "/pages/workbooks_2020",
  "/glossary",
  "/pages/computer_science_journeys_gallery",
];
const eventsLinks = ["/events", "/pages/event_types", "/safeguarding"];
const teacherEventLinks = ["/events?show_reservations_only=true"].concat(
  eventsLinks
);
const helpLinks = ["/support/teacher", "/support/student", "/contact"];

const navigationBarLinksPerRole: {
  [p in UserRole | "ANONYMOUS"]: { [menu in NavBarMenus]: string[] | null };
} = {
  ANONYMOUS: {
    "My Isaac": myIsaacLinks,
    Teach: null,
    Learn: learnLinks,
    Events: eventsLinks,
    Help: helpLinks,
    Admin: null,
  },
  STUDENT: {
    "My Isaac": myIsaacLinks,
    Teach: null,
    Learn: learnLinks,
    Events: eventsLinks,
    Help: helpLinks,
    Admin: null,
  },
  TUTOR: {
    "My Isaac": myIsaacLinks,
    Teach: tutorLinks,
    Learn: learnLinks,
    Events: eventsLinks,
    Help: helpLinks,
    Admin: null,
  },
  TEACHER: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: learnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: null,
  },
  EVENT_LEADER: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: learnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin/events"],
  },
  EVENT_MANAGER: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: learnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin", "/admin/events", "/admin/stats", "/admin/content_errors"],
  },
  CONTENT_EDITOR: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: learnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin", "/admin/stats", "/admin/content_errors"],
  },
  ADMIN: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: learnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: [
      "/admin",
      "/admin/usermanager",
      "/admin/events",
      "/admin/stats",
      "/admin/content_errors",
    ],
  },
};

describe("IsaacApp", () => {
  it("should open on the home page", async () => {
    renderTestEnvironment();
    await waitFor(() => {
      expect(history.location.pathname).toBe("/");
    });
  });

  // For each role (including a not-logged-in user), test whether the user sees the correct links in the navbar menu
  ["ANONYMOUS"].concat(USER_ROLES).forEach((r) => {
    const role = r as UserRole | "ANONYMOUS";
    it(`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
      renderTestEnvironment({ role });
      for (const [menu, hrefs] of Object.entries(
        navigationBarLinksPerRole[role]
      )) {
        const header = await screen.findByTestId("header");
        const navLink = within(header).queryByRole("link", {
          name: NAV_BAR_MENU_TITLE[menu as NavBarMenus],
        });
        if (hrefs === null) {
          // Expect link to be hidden from user
          expect(navLink).toBeNull();
          break;
        }
        expect(navLink).toBeDefined();
        if (!navLink) return; // appease TS
        // Check all menu options are available on click
        await userEvent.click(navLink);
        // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
        // related to a given title
        const adminMenuSectionParent = navLink.closest(
          "li[class*='nav-item']"
        ) as HTMLLIElement | null;
        if (!adminMenuSectionParent)
          fail(
            `Missing NavigationSection parent to check ${menu} navigation menu contains correct entries.`
          );
        const menuItems = await within(adminMenuSectionParent).findAllByRole(
          "menuitem"
        );
        zip(menuItems, hrefs).forEach(([link, href]) => {
          expect(link).toHaveAttribute("href", href);
        });
      }
    });
  });
  it.todo(
    "should show the users number of current assignments in the navigation menu"
  );

  it("should show featured news pods before non-featured ones, and order pods correctly based on id (CS only)", async () => {
    renderTestEnvironment();
    const transformPodList = (ps: any[]) => reverse(ps);
    const newsCarousel = await screen.findByTestId("carousel-inner");
    const featuredNewsSection = await screen.findByTestId("featured-news-item");
    const featuredNewsPod = await within(featuredNewsSection).findByTestId(
      "news-pod"
    );
    const newsCarouselPods = await within(newsCarousel).findAllByTestId(
      "news-pod"
    );
    const allNewsPodsInOrder = [featuredNewsPod].concat(newsCarouselPods);
    const newsPodLinks = allNewsPodsInOrder.map((p) =>
      within(p).queryAllByRole("link")[0]?.getAttribute("href")
    );
    expect(allNewsPodsInOrder).toHaveLength(5);
    const featuredNewsPodLinks = transformPodList(
      mockNewsPods.results
        .filter((p) => p.tags.includes(FEATURED_NEWS_TAG))
        .map((p) => p.url)
    );
    expect(newsPodLinks.slice(0, featuredNewsPodLinks.length)).toEqual(
      featuredNewsPodLinks
    );
    const nonFeaturedNewsPodLinks = transformPodList(
      mockNewsPods.results
        .filter((p) => !p.tags.includes(FEATURED_NEWS_TAG))
        .map((p) => p.url)
    );
    expect(newsPodLinks.slice(featuredNewsPodLinks.length)).toEqual(
      nonFeaturedNewsPodLinks
    );
  });

  it("should show the promo content banner for anonymous users", async () => {
    renderTestEnvironment({ role: "ANONYMOUS" });
    await screen.findByTestId("main");
    const promoContent = document.querySelector("#promo-content");
    expect(promoContent).toBeInTheDocument();
    await waitFor(() => {
      const publicPromoItem = screen.queryByText(
        mockPromoPods.results[1].value
      );
      expect(publicPromoItem).toBeInTheDocument();
    });
  });

  let roles = [
    "STUDENT",
    "TUTOR",
    "TEACHER",
    "EVENT_LEADER",
    "EVENT_MANAGER",
    "CONTENT_EDITOR",
    "ADMIN",
  ] as (UserRole | "ANONYMOUS")[];

  it.each(roles)(
    "should not show the promo content banner for %s users",
    async (role) => {
      renderTestEnvironment({ role });
      await screen.findByTestId("main");
      const promoContent = document.querySelector("#promo-content");
      expect(promoContent).not.toBeInTheDocument();
    }
  );

  it("should show the teacher promo tile for logged in teachers, and not show featured news", async () => {
    renderTestEnvironment({ role: "TEACHER" });
    await screen.findByTestId("main");
    const promoTile = await screen.findByTestId("promo-tile");
    expect(promoTile).toBeInTheDocument();
    const featuredNewsSection = screen.queryByTestId("featured-news-item");
    expect(featuredNewsSection).not.toBeInTheDocument();
    await waitFor(() => {
      const teacherPromoItem = screen.queryByText(
        mockPromoPods.results[0].title
      );
      expect(teacherPromoItem).toBeInTheDocument();
    });
  });

  roles = [
    "STUDENT",
    "TUTOR",
    "EVENT_LEADER",
    "EVENT_MANAGER",
    "CONTENT_EDITOR",
    "ADMIN",
    "ANONYMOUS",
  ];
  it.each(roles)(
    "should not show the promo tile for %s users",
    async (role) => {
      renderTestEnvironment({ role });
      await screen.findByTestId("main");
      const promoContent = screen.queryByTestId("promo-tile");
      expect(promoContent).not.toBeInTheDocument();
    }
  );
});
