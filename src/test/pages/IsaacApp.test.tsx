import {cleanup, render, screen, within} from "@testing-library/react/pure";
import {Provider} from "react-redux";
import {isaacApi, store} from "../../app/state";
import React from "react";
import {history} from "../../app/services/history";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import {zip} from "lodash";
import {Role, ROLES} from "../../IsaacApiTypes";
import {resetWithUserRole} from "./utils";
import {isPhy} from "../../app/services/siteConstants";

type NavBarTitle = "My Isaac" | "Teach" | "Learn" | "Events" | "Help" | "Admin";

const myIsaacLinks = ["/account", "/my_gameboards", "/assignments", "/progress", "/tests"];
const teacherLinks = ["/teacher_features", "/groups", "/set_assignments", "/assignment_progress", "/set_tests", "/set_tests#manage"];
const learnLinks = ["/11_14", "/gcse", "/alevel", "/gameboards/new", "/concepts"];
const eventsLinks = ["/events", "/pages/isaac_mentor"];
const loggedInEventLinks = ["/events?show_booked_only=true"].concat(eventsLinks);
const helpLinks = ["/pages/how_to_videos", "/solving_problems", "/support/student", "/support/teacher", "/contact"];

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

    beforeAll(() => {
        render(<Provider store={store}>
            <IsaacApp/>
        </Provider>);
    });

    afterAll(() => {
        // We have to do this manually because we imported /pure and we
        // don't want to affect the next test suite
        cleanup();
        store.dispatch(isaacApi.util.resetApiState());
    });

    it('should open on the home page', async () => {
        expect(history.location.pathname).toBe("/");
    });

    // For each role (including a not-logged-in user), test whether the user sees the correct links in the navbar menu
    isPhy && ["ANONYMOUS"].concat(ROLES).forEach((r) => {
        const role = r as Role | "ANONYMOUS";
        it (`should give a user with the role ${role} access to the correct navigation menu items`, async () => {
            resetWithUserRole(role);
            for (const [title, hrefs] of Object.entries(navigationBarLinksPerRole[role])) {
                const navLink = screen.queryByRole("link", {name: title, exact: false});
                if (hrefs === null) {
                    // Expect link to be hidden from user
                    expect(navLink).toBeNull();
                    return;
                }
                expect(navLink).toBeDefined();
                if (!navLink) return; // appease TS
                // Check all menu options are available on click
                await userEvent.click(navLink);
                const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
                if (!adminMenuSectionParent) fail(`Missing NavigationSection parent to check ${title} navigation menu contains correct entries.`);
                const menuItems = await within(adminMenuSectionParent).findAllByRole("menuitem");
                zip(menuItems, hrefs).forEach(([link, href]) => {
                    expect(link).toHaveAttribute("href", href);
                });
            }
        });
    });

    it('should show the users number of current assignments in the navigation menu', async () => {
        resetWithUserRole();
        const myAssignmentsBadge = await screen.findByTestId("my-assignments-badge");
        expect(myAssignmentsBadge.textContent?.includes("4")).toBeTruthy();
    });
});