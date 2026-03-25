import {RegisteredUserDTO, UserRole} from "../IsaacApiTypes";
import {render} from "@testing-library/react/pure";
import {server} from "../mocks/server";
import {http, HttpResponse, HttpHandler} from "msw";
import {ACCOUNT_TAB, ACCOUNT_TABS, ACTION_TYPE, API_PATH, isDefined, isPhy} from "../app/services";
import {produce} from "immer";
import {mockUser} from "../mocks/data";
import {isaacApi, removeToast, requestCurrentUser, store} from "../app/state";
import {Provider} from "react-redux";
import {IsaacApp} from "../app/components/navigation/IsaacApp";
import React from "react";
import {MemoryRouter} from "react-router";
import {fireEvent, screen, waitFor, within, act, renderHook, RenderHookResult} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SOME_FIXED_FUTURE_DATE_AS_STRING} from "./dateUtils";
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

export interface RenderTestEnvironmentOptions {
    role?: UserRole | "ANONYMOUS";
    modifyUser?: <T extends typeof mockUser | RegisteredUserDTO>(u: T) => T;
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
export const renderTestEnvironment = async (options?: RenderTestEnvironmentOptions) => {
    const {role, modifyUser, sessionExpires, PageComponent, initalRouteEntries, extraEndpoints} = options ?? {};
    await setUrl({pathname: "/"});
    resetStore();
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
        await store.dispatch(requestCurrentUser());
    }
    render(<Provider store={store}>
        {/* #root usually exists in index-{phy|ada}.html, but this is not loaded in Jest */}
        <div id="root" className="d-flex flex-column overflow-clip min-vh-100" data-bs-theme="neutral">
            {PageComponent
                ? <MemoryRouter initialEntries={initalRouteEntries ?? ['/']}>
                    <PageComponent/>
                </MemoryRouter>
                : <IsaacApp/>
            }
        </div>
    </Provider>);
};

export const renderTestHook = <Result, Props>(
    render: (initialProps: Props) => Result,
    { Wrapper, extraEndpoints }: { Wrapper?: React.FC<{children: React.ReactNode}>, extraEndpoints?: HttpHandler[] } = {}
): RenderHookResult<Result, Props> => {
    resetStore();
    server.resetHandlers();
    if (extraEndpoints) {
        server.use(...extraEndpoints);
    }
    
    return renderHook(render, {
        wrapper: ({children}) => <Provider store={store}>
            {Wrapper ? <Wrapper>{children}</Wrapper> : children}
        </Provider>
    });
};

export const resetStore = () => {
    store.dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    store.dispatch({type: ACTION_TYPE.ACTIVE_MODAL_CLOSE});
    store.dispatch(isaacApi.util.resetApiState());
    store.getState().toasts?.forEach(toast => toast.id && store.dispatch(removeToast(toast.id)));
};

// Clicks on the given navigation menu entry, allowing navigation around the app as a user would
export const followHeaderNavLink = async (menu: string, linkName: string) => {
    const header = await screen.findByTestId("header");
    const navLink = await within(header).findByRole("link", {name: new RegExp(`${menu}`)});
    await userEvent.click(navLink);
    // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
    // related to a given title
    const menuDropdownParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
    if (!menuDropdownParent) fail(`Missing NavigationSection parent - cannot locate entries in ${menu} navigation menu.`);

    const link = isPhy
        ? await within(menuDropdownParent).findByRole("menuitem", {name: linkName})
        : await within(menuDropdownParent).findByText(new RegExp(linkName, 'g'));

    await userEvent.click(link);
};

export const navigateToGroups = async () => {
    isPhy ?
        await followHeaderNavLink("My Isaac", "Manage groups")
        :
        await followHeaderNavLink("My Ada", "Teaching groups");
};

export const navigateToMyAccount = async () => {
    isPhy ?
        await followHeaderNavLink("My Isaac", "My account")
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
        await followHeaderNavLink("My Isaac", "Assignment progress")
        :
        await followHeaderNavLink("My Ada", "Markbook");
};

export const navigateToSetAssignments = async () => {
    isPhy ?
        await followHeaderNavLink("My Isaac", "Set assignments")
        :
        await followHeaderNavLink("My Ada", "Manage assignments");
};

// Open a given tab in the account page.
export const switchAccountTab = async (tab: ACCOUNT_TAB) => {
    // Switch to the correct tab
    const tabLink = await within(await screen.findByTestId("account-nav")).findByText(ACCOUNT_TABS.find(t => t.tab === tab)?.title ?? "");
    await userEvent.click(tabLink);
};

export const clickOn = async (e: string | RegExp | HTMLElement, container?: Promise<HTMLElement>) => {
    const target = await identify(e, container);
    if (target.hasAttribute('disabled')) {
        throw new Error(`Can't click on disabled button ${target.textContent}`);
    }
    await userEvent.click(target);
};

const identify = async (e: string | RegExp | HTMLElement, container?: Promise<HTMLElement>): Promise<HTMLElement> => {
    if (e instanceof HTMLElement) {
        return e;
    } else if (container) {
        return within(await container).getByText(e);
    } else {
        return screen.getByText(e);
    }
};

export const enterInput = async (placeholder: string, input: string) => {
    const textBox = await screen.findByPlaceholderText(placeholder);
    if (textBox.hasAttribute('disabled')) {
        throw new Error(`Can't inter text into  disabled field ${[placeholder]}`);
    }
    await userEvent.type(textBox, input);
};

export const waitForLoaded = async () => {
    await waitFor(async () => {
        expect(screen.queryAllByText("Loading...")).toHaveLength(0);
        expect(screen.queryAllByText("Searching...")).toHaveLength(0);
        await new Promise(process.nextTick);
    });
};

export const expectUrl = (text: string) => waitFor(() => {
    expect(location.pathname).toBe(text);
});

export const expectUrlParams = (text: SearchString | '') => waitFor(() => {
    expect(location.search).toBe(text);
});

export const withSizedWindow = async (width: number, height: number, cb: () => void) => {
    const originalWindow = {
        width: window.innerWidth,
        height: window.innerHeight,
    };
    try {
        await act(async () => {
            window.innerWidth = width;
            window.innerHeight = height;
        });
        fireEvent(window, new Event('resize'));
        cb();
    } finally {
        await act(async () => {
            window.innerWidth = originalWindow.width;
            window.innerHeight = originalWindow.height;
        });
        fireEvent(window, new Event('resize'));
    }
};

export type PathString = `/${string}`;
export type SearchString = `?${string}`;
export const setUrl = async (location: Partial<URL>) => {
    // this act seems to be generating a lot of warnings for both being there and for not being there if you remove it. 
    // seems like an RTL issue: https://github.com/testing-library/react-testing-library/issues/1413
    await act(async () => {
        // push a new state, then go to it
        history.pushState({}, "", `${location?.pathname}${location?.search ?? ''}${location?.hash ?? ''}`);
        fireEvent(window, new PopStateEvent('popstate'));
    });
};

export const goBack = () => history.back();

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

export const withMockedDate = async (date: number, fn: () => Promise<void>) => {
    try {
        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(date).valueOf());
        await fn();
    } finally {
        jest.spyOn(global.Date, 'now').mockRestore();
    }
};

const expectHeading = (n: number) => (txt?: string) => expect(screen.getByRole('heading', { level: n })).toHaveTextContent(`${txt}`);

export const expectH1 = expectHeading(1);

export const expectH2 = expectHeading(2);

export const expectH4 = expectHeading(4);

export const expectTextInElementWithId = (testId: string) => (msg: string) => expect(screen.getByTestId(testId)).toHaveTextContent(msg);

export const expectLinkWithEnabledBackwardsNavigation = async (text: string | undefined, targetHref: string, originalHref: string) => {
    if (text === undefined) {
        throw new Error("Target text is undefined");
    }
    const container = isPhy ? screen.findByRole("link", { name: text}) : undefined;
    await clickOn(text, container);
    await expectUrl(targetHref);
    goBack();
    await expectUrl(originalHref);
};
