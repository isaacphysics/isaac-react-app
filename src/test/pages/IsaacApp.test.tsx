import React from "react";
import "@testing-library/jest-dom/extend-expect";
import {cleanup, screen, waitFor, within} from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import {reverse, zip} from "lodash";
import {Role, ROLES} from "../../IsaacApiTypes";
import {renderTestEnvironment} from "./utils";
import {FEATURED_NEWS_TAG, isPhy, siteSpecific, history} from "../../app/services";
import {mockNewsPods} from "../../mocks/data";

type NavBarTitle = "My Isaac" | "Teach" | "Learn" | "Events" | "Help" | "Admin";

const myIsaacLinks = siteSpecific(
    ["/account", "/my_gameboards", "/assignments", "/progress", "/tests"],
    ["/assignments", "/my_gameboards", "/progress", "/tests", "/student_rewards"]
);
const teacherLinks = siteSpecific(
    ["/teacher_features", "/groups", "/set_assignments", "/assignment_progress", "/set_tests", "/set_tests#manage"],
    ["/groups", "/set_assignments", "/assignment_progress", "/set_tests", "/teaching_order"]
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

const navigationBarLinksPerRole: {[p in (Role | "ANONYMOUS")]: {[title in NavBarTitle]: string[] | null}} = {
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
        cleanup();
    });

    // For each role (including a not-logged-in user), test whether the user sees the correct links in the navbar menu
    ["ANONYMOUS"].concat(ROLES).forEach((r) => {
        const role = r as Role | "ANONYMOUS";
        it (`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
            renderTestEnvironment({role});
            for (const [title, hrefs] of Object.entries(navigationBarLinksPerRole[role])) {
                const navLink = screen.queryByRole("link", {name: title, exact: false});
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
                if (!adminMenuSectionParent) fail(`Missing NavigationSection parent to check ${title} navigation menu contains correct entries.`);
                const menuItems = await within(adminMenuSectionParent).findAllByRole("menuitem");
                zip(menuItems, hrefs).forEach(([link, href]) => {
                    expect(link).toHaveAttribute("href", href);
                });
            }
            cleanup();
        });
    });

    // TODO implement test data and this test for CS
    isPhy && it('should show the users number of current assignments in the navigation menu', async () => {
        renderTestEnvironment();
        const myAssignmentsBadge = await screen.findByTestId("my-assignments-badge");
        expect(myAssignmentsBadge.textContent?.includes("4")).toBeTruthy();
    });

    it('should show featured news pods before non-featured ones, and order pods correctly based on id', async () => {
        const transformPodList = siteSpecific((ps: any[]) => ps, (ps: any[]) => reverse(ps));
        const newsPods = screen.queryAllByTestId("featured-news-item") // picks up the CS featured news item first
            .concat(within(await screen.findByTestId("carousel-inner")).queryAllByTestId("news-pod"));
        const newsPodLinks = newsPods.map(p => within(p).queryAllByRole("link")[0]?.getAttribute("href"));
        expect(newsPods).toHaveLength(5);
        const featuredNewsPodLinks = transformPodList(
            mockNewsPods.results.filter(p => p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
        );
        expect(newsPodLinks.slice(0, featuredNewsPodLinks.length)).toEqual(featuredNewsPodLinks);
        const nonFeaturedNewsPodLinks = transformPodList(
            mockNewsPods.results.filter(p => !p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
        );
        expect(newsPodLinks.slice(featuredNewsPodLinks.length)).toEqual(nonFeaturedNewsPodLinks);
        cleanup();
    });
});