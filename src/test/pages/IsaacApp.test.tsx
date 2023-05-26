import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {reverse, zip} from "lodash";
import {UserRole, USER_ROLES} from "../../IsaacApiTypes";
import {renderTestEnvironment, NavBarMenus, NAV_BAR_MENU_TITLE} from "../utils";
import {FEATURED_NEWS_TAG, siteSpecific, history} from "../../app/services";
import {mockNewsPods} from "../../mocks/data";

const myIsaacLinks = ["/assignments", "/my_gameboards", "/progress", "/tests"]
const tutorLinks = ["/groups", "/set_assignments", "/my_markbook"];
const teacherLinks = ["/groups", "/set_assignments", "/my_markbook", "/set_tests", "/teaching_order"];
const learnLinks = ["/topics/gcse", "/topics/a_level", "/gameboards/new", "/pages/workbooks_2020", "/glossary", "/pages/computer_science_journeys_gallery"];
const eventsLinks = ["/events?types=student", "/events?types=teacher", "/pages/event_types", "/safeguarding"];
const teacherEventLinks = ["/events?show_reservations_only=true"].concat(eventsLinks);
const helpLinks = ["/support/teacher", "/support/student", "/contact"];

const navigationBarLinksPerRole: {[p in (UserRole | "ANONYMOUS")]: {[menu in NavBarMenus]: string[] | null}} = {
    ANONYMOUS: {
        "My Isaac": myIsaacLinks,
        Teach: null,
        Learn: learnLinks,
        Events: eventsLinks,
        Help: helpLinks,
        Admin: null
    },
    STUDENT: {
        "My Isaac": myIsaacLinks,
        Teach: null,
        Learn: learnLinks,
        Events: eventsLinks,
        Help: helpLinks,
        Admin: null
    },
    TUTOR: {
        "My Isaac": myIsaacLinks,
        Teach: tutorLinks,
        Learn: learnLinks,
        Events: eventsLinks,
        Help: helpLinks,
        Admin: null
    },
    TEACHER: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: teacherEventLinks,
        Help: helpLinks,
        Admin: null
    },
    EVENT_LEADER: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: teacherEventLinks,
        Help: helpLinks,
        Admin: ["/admin/events"]
    },
    EVENT_MANAGER: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: teacherEventLinks,
        Help: helpLinks,
        Admin: ["/admin", "/admin/events", "/admin/stats", "/admin/content_errors"]
    },
    CONTENT_EDITOR: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: teacherEventLinks,
        Help: helpLinks,
        Admin: ["/admin", "/admin/stats", "/admin/content_errors"]
    },
    ADMIN: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: teacherEventLinks,
        Help: helpLinks,
        Admin: ["/admin", "/admin/usermanager", "/admin/events", "/admin/stats", "/admin/content_errors"]
    }
};

describe("IsaacApp", () => {

    it('should open on the home page', async () => {
        renderTestEnvironment();
        await waitFor(() => {
            expect(history.location.pathname).toBe("/");
        });
    });

    // For each role (including a not-logged-in user), test whether the user sees the correct links in the navbar menu
    ["ANONYMOUS"].concat(USER_ROLES).forEach((r) => {
        const role = r as UserRole | "ANONYMOUS";
        it (`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
            renderTestEnvironment({role});
            for (const [menu, hrefs] of Object.entries(navigationBarLinksPerRole[role])) {
                const header = await screen.findByTestId("header");
                const navLink = within(header).queryByRole("link", {name: NAV_BAR_MENU_TITLE[menu as NavBarMenus]});
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
                const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
                if (!adminMenuSectionParent) fail(`Missing NavigationSection parent to check ${menu} navigation menu contains correct entries.`);
                const menuItems = await within(adminMenuSectionParent).findAllByRole("menuitem");
                zip(menuItems, hrefs).forEach(([link, href]) => {
                    expect(link).toHaveAttribute("href", href);
                });
            }
        });
    });
    it.todo("should show the users number of current assignments in the navigation menu");
    
    it('should show featured news pods before non-featured ones, and order pods correctly based on id (CS only)', async () => {
        renderTestEnvironment();
        const transformPodList = siteSpecific((ps: any[]) => ps, (ps: any[]) => reverse(ps));
        const newsCarousel = await screen.findByTestId("carousel-inner");
        const featuredNewsSection = await screen.findByTestId("featured-news-item");
        const featuredNewsPod = await within(featuredNewsSection).findByTestId("news-pod");
        const newsCarouselPods = await within(newsCarousel).findAllByTestId("news-pod");
        const allNewsPodsInOrder = [featuredNewsPod].concat(newsCarouselPods);
        const newsPodLinks = allNewsPodsInOrder.map(p => within(p).queryAllByRole("link")[0]?.getAttribute("href"));
        expect(allNewsPodsInOrder).toHaveLength(5);
        const featuredNewsPodLinks = transformPodList(
            mockNewsPods.results.filter(p => p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
        );
        expect(newsPodLinks.slice(0, featuredNewsPodLinks.length)).toEqual(featuredNewsPodLinks);
        const nonFeaturedNewsPodLinks = transformPodList(
            mockNewsPods.results.filter(p => !p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
        );
        expect(newsPodLinks.slice(featuredNewsPodLinks.length)).toEqual(nonFeaturedNewsPodLinks);
    });
});