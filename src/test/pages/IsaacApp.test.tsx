import React from "react";
import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import {reverse, zip} from "lodash";
import {UserRole, USER_ROLES} from "../../IsaacApiTypes";
import {renderTestEnvironment, NavBarMenus, NAV_BAR_MENU_TITLE} from "../utils";
import {FEATURED_NEWS_TAG, isPhy, siteSpecific, history, isCS, SITE_SUBJECT} from "../../app/services";
import {mockNewsPods} from "../../mocks/data";

const myIsaacLinks = siteSpecific(
    ["/account", "/my_gameboards", "/assignments", "/progress", "/tests"],
    ["/assignments", "/my_gameboards", "/progress", "/tests"]
);
const tutorLinks = siteSpecific(
    ["/tutor_features", "/groups", "/set_assignments", "/assignment_progress"],
    ["/groups", "/set_assignments", "/my_markbook"]
);
const teacherLinks = siteSpecific(
    ["/teacher_features", "/groups", "/set_assignments", "/assignment_progress", "/set_tests", "/set_tests#manage"],
    ["/groups", "/set_assignments", "/my_markbook", "/set_tests", "/teaching_order"]
);
const learnLinks = siteSpecific(
    ["/11_14", "/gcse", "/alevel", "/gameboards/new", "/concepts"],
    ["/topics/gcse", "/topics/a_level", "/gameboards/new", "/pages/workbooks_2020", "/glossary", "/pages/computer_science_journeys_gallery"]
);
const eventsLinks = siteSpecific(
    ["/events", "/pages/isaac_mentor"],
    ["/events?types=student", "/events?types=teacher", "/pages/event_types", "/safeguarding"]
);
const loggedInEventLinks = siteSpecific(
    ["/events?show_booked_only=true"],
    [] as string[]
).concat(eventsLinks);
const teacherEventLinks = siteSpecific(
    [] as string[],
    ["/events?show_reservations_only=true"]
).concat(loggedInEventLinks);
const helpLinks = siteSpecific(
    ["/pages/how_to_videos", "/solving_problems", "/support/student", "/support/teacher", "/contact"],
    ["/support/teacher", "/support/student", "/contact"],
);

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
        Events: loggedInEventLinks,
        Help: helpLinks,
        Admin: null
    },
    TUTOR: {
        "My Isaac": myIsaacLinks,
        Teach: tutorLinks,
        Learn: learnLinks,
        Events: loggedInEventLinks,
        Help: helpLinks.map(l => isPhy && (l === "/support/teacher") ? "/support/tutor" : l),
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
                const navLink = within(header).queryByRole("link", {name: NAV_BAR_MENU_TITLE[SITE_SUBJECT][menu as NavBarMenus]});
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

    // TODO implement test data and this test for CS
    isPhy && it('should show the users number of current assignments in the navigation menu (Physics only)', async () => {
        renderTestEnvironment();
        const myAssignmentsBadge = await screen.findByTestId("my-assignments-badge");
        expect(myAssignmentsBadge.textContent?.includes("4")).toBeTruthy();
    });

    isCS && it('should show featured news pods before non-featured ones, and order pods correctly based on id (CS only)', async () => {
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