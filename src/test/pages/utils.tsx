import {Role} from "../../IsaacApiTypes";
import {render} from "@testing-library/react/pure";
import {server} from "../../mocks/server";
import {rest, RestHandler} from "msw";
import {ACTION_TYPE, API_PATH} from "../../app/services";
import produce from "immer";
import {mockUser} from "../../mocks/data";
import {isaacApi, requestCurrentUser, store} from "../../app/state";
import {Provider} from "react-redux";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import React from "react";
import {isDefined} from "../../app/services";
import {MemoryRouter} from "react-router";

export const augmentErrorMessage = (message?: string) => (e: Error) => {
    return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
}

interface RenderTestEnvironmentOptions {
    role?: Role | "ANONYMOUS";
    modifyUser?: (u: typeof mockUser) => typeof mockUser;
    PageComponent?: React.FC<any>;
    initalRouteEntries?: string[];
    extraEndpoints?: RestHandler<any>[];
}
// Flexible helper function to setup different kinds of test environments. You can:
//  - Choose the role of the mock user
//  - Apply an arbitrary transformation to the mock user
//  - Choose which page component you want  to render (if it is omitted, IsaacApp will be rendered)
//  - Define extra endpoint handlers for the MSW server
//  - Setup the initial history of the routing component (doesn't apply if IsaacApp is being rendered in full)
// If IsaacApp is rendered, it won't be wrapped in another router. Any component will be wrapped in a Redux
// Provider with the global store.
// When called, the Redux store will be cleaned completely, and other the MSW server handlers will be reset to
// defaults (those in handlers.ts).
export const renderTestEnvironment = (options?: RenderTestEnvironmentOptions) => {
    const {role, modifyUser, PageComponent, initalRouteEntries, extraEndpoints} = options ?? {};
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
            ? <MemoryRouter initialEntries={initalRouteEntries ?? []}>
                <PageComponent/>
            </MemoryRouter>
            : <IsaacApp/>}
    </Provider>);
};

export const dayMonthYearStringToDate = (d?: string) => {
    if (!d) return undefined;
    const parts = d.split("/").map(n => parseInt(n, 10));
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

export const ONE_DAY_IN_MS = 86400000;

export const DDMMYYYY_REGEX = /\d{2}\/\d{2}\/\d{4}/;