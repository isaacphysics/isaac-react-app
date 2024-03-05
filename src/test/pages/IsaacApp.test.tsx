import React from "react";
import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import zip from "lodash/zip";
import {USER_ROLES, UserRole} from "../../IsaacApiTypes";
import {NAV_BAR_MENU_TITLE, NavBarMenus, renderTestEnvironment} from "../utils";
import {history, isPhy, PATHS, SITE_SUBJECT, siteSpecific} from "../../app/services";

const myIsaacLinks = siteSpecific(
    ["/account", PATHS.MY_GAMEBOARDS, PATHS.MY_ASSIGNMENTS, "/progress", "/tests"],
    [PATHS.MY_ASSIGNMENTS, PATHS.MY_GAMEBOARDS, "/tests", "/progress", "/account"]
);
const tutorLinks = siteSpecific(
    ["/tutor_features", "/groups", PATHS.SET_ASSIGNMENTS, "/assignment_schedule", PATHS.ASSIGNMENT_PROGRESS],
    ["/groups", PATHS.SET_ASSIGNMENTS, PATHS.ASSIGNMENT_PROGRESS]
);
const teacherLinks = siteSpecific(
    ["/teacher_features", "/groups", PATHS.SET_ASSIGNMENTS, "/assignment_schedule", PATHS.ASSIGNMENT_PROGRESS, "/set_tests"],
    ["/groups", PATHS.SET_ASSIGNMENTS, "/set_tests", PATHS.ASSIGNMENT_PROGRESS, "/teaching_order"]
);
const learnLinks = siteSpecific(
    ["/11_14", "/gcse", "/alevel", PATHS.QUESTION_FINDER, "/concepts", "/glossary"],
    ["/topics", PATHS.QUESTION_FINDER, "/glossary", "/pages/computer_science_stories"]
);
const eventsLinks = siteSpecific(
    ["/events", "/pages/isaac_mentor"],
    ["/pages/student_challenges"] // ["/events?types=student", "/events?types=teacher", "/pages/event_types", "/safeguarding"] // teacher only ["/events?show_reservations_only=true"]
);
const loggedInEventLinks = siteSpecific(
    ["/events?show_booked_only=true"],
    ["/pages/student_challenges"]
)?.concat(eventsLinks ?? []) ?? null;
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
        Events: loggedInEventLinks,
        Help: helpLinks,
        Admin: null
    },
    EVENT_LEADER: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: loggedInEventLinks,
        Help: helpLinks,
        Admin: ["/admin/events"]
    },
    EVENT_MANAGER: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: loggedInEventLinks,
        Help: helpLinks,
        Admin: ["/admin", "/admin/events", "/admin/stats", "/admin/content_errors"]
    },
    CONTENT_EDITOR: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: loggedInEventLinks,
        Help: helpLinks,
        Admin: ["/admin", "/admin/stats", "/admin/content_errors"]
    },
    ADMIN: {
        "My Isaac": myIsaacLinks,
        Teach: teacherLinks,
        Learn: learnLinks,
        Events: loggedInEventLinks,
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
        it(`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
            renderTestEnvironment({role});
            for (const [menu, hrefs] of Object.entries(navigationBarLinksPerRole[role])) {
                const header = await screen.findByTestId("header");
                const menuTitle = NAV_BAR_MENU_TITLE[SITE_SUBJECT][menu as NavBarMenus];
                if (!menuTitle) {
                    // This menu is not available on this site, so skip it
                    return;
                }
                const navLink = within(header).queryByRole("link", {name: menuTitle});
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

    // TODO broken since we only show 3-4 news pods on the homepage
    // isAda && it('should show featured news pods before non-featured ones, and order pods correctly based on id (CS only)', async () => {
    //     renderTestEnvironment();
    //     const transformPodList = siteSpecific((ps: any[]) => ps, (ps: any[]) => reverse(ps));
    //     const newsCarousel = await screen.findByTestId("news-pod-deck");
    //     const newsPods = await within(newsCarousel).findAllByTestId("news-pod");
    //     const newsPodLinks = newsPods.map(p => within(p).queryAllByRole("link")[0]?.getAttribute("href"));
    //     expect(newsPods).toHaveLength(4);
    //     const featuredNewsPodLinks = transformPodList(
    //         mockNewsPods.results.filter(p => p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
    //     );
    //     expect(newsPodLinks.slice(0, featuredNewsPodLinks.length)).toEqual(featuredNewsPodLinks);
    //     const nonFeaturedNewsPodLinks = transformPodList(
    //         mockNewsPods.results.filter(p => !p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
    //     );
    //     expect(newsPodLinks.slice(featuredNewsPodLinks.length)).toEqual(nonFeaturedNewsPodLinks);
    // });
});
