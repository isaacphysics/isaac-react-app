import {UserRole} from "../IsaacApiTypes";
import {render} from "@testing-library/react/pure";
import {server} from "../mocks/server";
import {http, HttpResponse, HttpHandler} from "msw";
import {ACCOUNT_TAB, ACCOUNT_TABS, ACTION_TYPE, API_PATH, isDefined, isPhy} from "../app/services";
import {produce} from "immer";
import {mockUser} from "../mocks/data";
import {isaacApi, requestCurrentUser, store} from "../app/state";
import {Provider} from "react-redux";
import {IsaacApp} from "../app/components/navigation/IsaacApp";
import React from "react";
import {MemoryRouter} from "react-router";
import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SOME_FIXED_FUTURE_DATE_AS_STRING} from "./dateUtils";
import { history } from "../app/services";
import { LocationDescriptor } from "history";
import * as miscUtils from '../app/services/miscUtils';

export function paramsToObject(entries: URLSearchParams): {[key: string]: string} {
    const result: {[key: string]: string} = {};
    for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
        result[key] = value;
    }
    return result;
}

export const augmentErrorMessage = (message?: string) => (e: Error) => {
    return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
};

interface RenderTestEnvironmentOptions {
    role?: UserRole | "ANONYMOUS";
    modifyUser?: (u: typeof mockUser) => typeof mockUser;
    sessionExpires?: string;
    PageComponent?: React.FC<any>;
    initalRouteEntries?: string[];
    extraEndpoints?: HttpHandler[];
}
// Flexible helper function to set up different kinds of test environments. You can:
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
    const {role, modifyUser, sessionExpires, PageComponent, initalRouteEntries, extraEndpoints} = options ?? {};
    store.dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    store.dispatch(isaacApi.util.resetApiState());
    server.resetHandlers();
    if (role || modifyUser) {
        server.use(
            http.get(API_PATH + "/users/current_user", () => {
                if (role === "ANONYMOUS") {
                    return HttpResponse.json({
                        responseCode: 401,
                        responseCodeType: "Unauthorized",
                        errorMessage: "You must be logged in to access this resource.",
                        bypassGenericSiteErrorPage: false
                    }, {
                        status: 401,
                    }
                    );
                }
                const userWithRole = produce(mockUser, user => {
                    user.role = role ?? mockUser.role;
                });
                return HttpResponse.json(modifyUser ? modifyUser(userWithRole) : userWithRole, {
                    status: 200,
                    headers: {
                        "x-session-expires": sessionExpires ?? SOME_FIXED_FUTURE_DATE_AS_STRING,
                    }
                });
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
            ? <MemoryRouter initialEntries={initalRouteEntries ?? []}>
                <PageComponent/>
            </MemoryRouter>
            : <IsaacApp/>}
    </Provider>);
};

// Clicks on the given navigation menu entry, allowing navigation around the app as a user would
export const followHeaderNavLink = async (menu: string, linkName: string) => {
    const header = await screen.findByTestId("header");
    const navLink = await within(header).findByRole("link", {name: new RegExp(`^${menu}`)});
    await userEvent.click(navLink);
    // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
    // related to a given title
    const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
    if (!adminMenuSectionParent) fail(`Missing NavigationSection parent - cannot locate entries in ${menu} navigation menu.`);
    const link = await within(adminMenuSectionParent).findByRole("menuitem", {name: linkName});
    await userEvent.click(link);
};

export const navigateToGroups = async () => {
    isPhy ?
        await followHeaderNavLink("Teach", "Manage Groups")
        :
        await followHeaderNavLink("My Ada", "Teaching groups");
};

export const navigateToMyAccount = async () => {
    isPhy ?
        await followHeaderNavLink("My Isaac", "My Account")
        :
        await followHeaderNavLink("My Ada", "My account");
};

export const navigateToUserManager = async () => {
    isPhy ?
        await followHeaderNavLink("Admin", "User Manager")
        :
        await followHeaderNavLink("Admin", "User manager");
};

export const navigateToAssignmentProgress = async () => {
    isPhy ?
        await followHeaderNavLink("Teach", "Assignment Progress")
        :
        await followHeaderNavLink("My Ada", "Markbook");
};

// Open a given tab in the account page.
export const switchAccountTab = async (tab: ACCOUNT_TAB) => {
    // Switch to the correct tab
    const tabLink = await within(await screen.findByTestId("account-nav")).findByText(ACCOUNT_TABS.find(t => t.tab === tab)?.title ?? "");
    await userEvent.click(tabLink);
};

export const clickButton = async (text: string, container?: Promise<HTMLElement>) => {
    const [button] = await (container ? within(await container).findAllByText(text).then(e => e) : screen.findAllByText(text));
    if (button.hasAttribute('disabled')) {
        throw new Error(`Can't click on disabled button ${button.textContent}`);
    }
    await userEvent.click(button);
};

export const enterInput = async (placeholder: string, input: string) => {
    const textBox = await screen.findByPlaceholderText(placeholder);
    if (textBox.hasAttribute('disabled')) {
        throw new Error(`Can't inter text into  disabled field ${[placeholder]}`);
    }
    await userEvent.type(textBox, input);
};

export const waitForLoaded = () => waitFor(() => {
    expect(screen.queryAllByText("Loading...")).toHaveLength(0);
});

export const expectUrlParams = (text: string) => waitFor(() => {
    expect(history.location.search).toBe(text);
});

export const setUrl = (location: LocationDescriptor) => history.push(location);

export const withMockedRandom = async (fn: (randomSequence: (n: number[]) => void) => Promise<void>) => {
    const nextRandom = {
        values: [] as number[],
        get() { return this.values.shift() ?? Math.random(); },
        set(arr: number[]) { this.values = arr; }
    };

    try {
        jest.spyOn(miscUtils, 'nextRandom').mockImplementation(() => nextRandom.get());
        await fn(nextRandom.set.bind(nextRandom));         
    } finally {
        jest.spyOn(miscUtils, 'nextRandom').mockRestore();
    }
};
