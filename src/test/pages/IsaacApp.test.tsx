import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { zip } from "lodash";
import { renderTestEnvironment, NavBarMenus, NAV_BAR_MENU_TITLE, TestUserRole } from "../utils";
import { USER_ROLES, history } from "../../app/services";
import { mockPromoPods } from "../../mocks/data";

const myIsaacLinks = ["/assignments", "/my_gameboards", "/progress", "/tests"];
const tutorLinks = ["/groups", "/set_assignments", "/my_markbook"];
const teacherLinks = [
  "/groups",
  "/set_assignments",
  "/my_markbook",
  "/set_tests",
  "/teaching_order_g_ocr",
  "/teaching_order",
];
const learnLinks = [
  "/topics/gcse",
  "/topics/a_level",
  "/gameboards/new",
  "/pages/computer_science_journeys_gallery",
  "/careers_in_computer_science",
  "/glossary",
];
const eventsLinks = ["/events", "/safeguarding"];
const teacherEventLinks = ["/events?show_reservations_only=true"].concat(eventsLinks);
const teacherLearnLinks = ["/pages/workbooks_2020"].concat(learnLinks);
const helpLinks = ["/support/teacher", "/support/student", "/contact"];

const navigationBarLinksPerRole: {
  [p in TestUserRole]: { [menu in NavBarMenus]: string[] | null };
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
    Learn: teacherLearnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: null,
  },
  EVENT_LEADER: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: teacherLearnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin/events"],
  },
  EVENT_MANAGER: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: teacherLearnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin", "/admin/events", "/admin/stats", "/admin/content_errors"],
  },
  CONTENT_EDITOR: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: teacherLearnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin", "/admin/stats", "/admin/content_errors"],
  },
  ADMIN: {
    "My Isaac": myIsaacLinks,
    Teach: teacherLinks,
    Learn: teacherLearnLinks,
    Events: teacherEventLinks,
    Help: helpLinks,
    Admin: ["/admin", "/admin/usermanager", "/admin/events", "/admin/stats", "/admin/content_errors"],
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
    const role = r as TestUserRole;
    it(`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
      renderTestEnvironment({ role });
      for (const [menu, hrefs] of Object.entries(navigationBarLinksPerRole[role])) {
        const header = await screen.findByTestId("header");
        const navLink = within(header).queryByRole("link", {
          name: NAV_BAR_MENU_TITLE[menu as NavBarMenus],
        });
        if (hrefs === null) {
          // Expect link to be hidden from user
          expect(navLink).toBeNull();
          continue;
        }
        expect(navLink).toBeDefined();
        if (!navLink) continue; // appease TS
        // Check all menu options are available on click
        await userEvent.click(navLink);
        // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
        // related to a given title
        const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
        if (!adminMenuSectionParent)
          fail(`Missing NavigationSection parent to check ${menu} navigation menu contains correct entries.`);
        const menuItems = await within(adminMenuSectionParent).findAllByRole("menuitem");
        zip(menuItems, hrefs).forEach(([link, href]) => {
          expect(link).toHaveAttribute("href", href);
        });
      }
    });
  });
  it.todo("should show the users number of current assignments in the navigation menu");

  it("should show the promo content banner for anonymous users", async () => {
    renderTestEnvironment({ role: "ANONYMOUS" });
    await screen.findByTestId("main");
    const promoContent = document.querySelector("#promo-content");
    expect(promoContent).toBeInTheDocument();
    await waitFor(() => {
      const publicPromoItem = screen.queryByText(mockPromoPods.results[1].value);
      expect(publicPromoItem).toBeInTheDocument();
    });
  });

  it.each(USER_ROLES)("should not show the promo content banner for %s users", async (role) => {
    renderTestEnvironment({ role });
    await screen.findByTestId("main");
    const promoContent = document.querySelector("#promo-content");
    expect(promoContent).not.toBeInTheDocument();
  });
});
