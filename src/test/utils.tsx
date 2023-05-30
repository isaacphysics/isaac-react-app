import {UserRole} from "../IsaacApiTypes";
import {render} from "@testing-library/react/pure";
import {server} from "../mocks/server";
import {rest, RestHandler} from "msw";
import {ACTION_TYPE, API_PATH} from "../app/services";
import produce from "immer";
import {mockUser} from "../mocks/data";
import {isaacApi, requestCurrentUser, store} from "../app/state";
import {Provider} from "react-redux";
import {IsaacApp} from "../app/components/navigation/IsaacApp";
import React from "react";
import {isDefined} from "../app/services";
import {MemoryRouter} from "react-router";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const augmentErrorMessage = (message?: string) => (e: Error) => {
    return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
}

interface RenderTestEnvironmentOptions {
    role?: UserRole | "ANONYMOUS";
    modifyUser?: (u: typeof mockUser) => typeof mockUser;
    PageComponent?: React.FC<any>;
    initialRouteEntries?: string[];
    extraEndpoints?: RestHandler<any>[];
}
// Flexible helper function to setup different kinds of test environments. You can:
//  - Choose the role of the mock user (defaults to ADMIN)
//  - Apply an arbitrary transformation to the mock user
//  - Choose which page component you want  to render (if it is omitted, IsaacApp will be rendered)
//  - Define extra endpoint handlers for the MSW server (will have priority over existing ones)
//  - Setup the initial history of the routing component (doesn't apply if IsaacApp is being rendered in full)
// If IsaacApp is rendered, it won't be wrapped in another router. Any component will be wrapped in a Redux
// Provider with the global store.
// When called, the Redux store will be cleaned completely, and other the MSW server handlers will be reset to
// defaults (those in handlers.ts).
export const renderTestEnvironment = (options?: RenderTestEnvironmentOptions) => {
    const {role, modifyUser, PageComponent, initialRouteEntries, extraEndpoints} = options ?? {};
    store.dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    store.dispatch(isaacApi.util.resetApiState());
    server.resetHandlers();
    if (role || modifyUser) {
        server.use(
            rest.get(API_PATH + "/users/current_user", (req, res, ctx) => {
                if (role === "ANONYMOUS") {
                    return res(
                        ctx.status(401),
                        ctx.json({
                            responseCode: 401,
                            responseCodeType: "Unauthorized",
                            errorMessage: "You must be logged in to access this resource.",
                            bypassGenericSiteErrorPage: false
                        })
                    );
                }
                const userWithRole = produce(mockUser, user => {
                    user.role = role ?? mockUser.role;
                });
                return res(
                    ctx.status(200),
                    ctx.json(modifyUser ? modifyUser(userWithRole) : userWithRole)
                );
            }),
        );
    }
    if (extraEndpoints) {
        server.use(...extraEndpoints);
    }
    if (isDefined(PageComponent) && PageComponent.name !== "IsaacApp") {
        store.dispatch(requestCurrentUser());
    }
    render(<Provider store={store}>
        {PageComponent
            ? <MemoryRouter initialEntries={initialRouteEntries ?? []}>
                <PageComponent/>
            </MemoryRouter>
            : <IsaacApp/>}
    </Provider>);
};

export type NavBarMenus = "My Isaac" | "Teach" | "Learn" | "Events" | "Help" | "Admin";
export const NAV_BAR_MENU_TITLE: {[menu in NavBarMenus]: string} = {
        "My Isaac": "My Isaac",
        Teach: "Teachers",
        Learn: "Learn",
        Events: "Events",
        Help: "Help and support",
        Admin: "Admin"
};

// Clicks on the given navigation menu entry, allowing navigation around the app as a user would
export const followHeaderNavLink = async (menu: NavBarMenus, linkName: string) => {
    const header = await screen.findByTestId("header");
    const navLink = await within(header).findByRole("link",  {name: NAV_BAR_MENU_TITLE[menu]});
    await userEvent.click(navLink);
    // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
    // related to a given title
    const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
    if (!adminMenuSectionParent) fail(`Missing NavigationSection parent - cannot locate entries in ${menu} navigation menu.`);
    const link = await within(adminMenuSectionParent).findByRole("menuitem", {name: linkName, exact: false});
    await userEvent.click(link);
};

export const dayMonthYearStringToDate = (d?: string) => {
    if (!d) return undefined;
    const parts = d.split("/").map(n => parseInt(n, 10));
    return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0);
}

export const ONE_DAY_IN_MS = 86400000;
export const DDMMYYYY_REGEX = /\d{2}\/\d{2}\/\d{4}/;

export const NOW = Date.now(); // Use same "now" for all time relative calculations
export const DAYS_AGO = (n: number, roundDownToNearestDate = false) => {
    let d = new Date(NOW);
    d.setUTCDate(d.getUTCDate() - n);
    if (roundDownToNearestDate) d.setHours(0, 0, 0, 0);
    return d.valueOf();
};
