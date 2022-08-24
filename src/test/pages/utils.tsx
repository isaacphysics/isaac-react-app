import {Role} from "../../IsaacApiTypes";
import {cleanup, render} from "@testing-library/react/pure";
import {server} from "../../mocks/server";
import {rest} from "msw";
import {API_PATH} from "../../app/services/constants";
import produce from "immer";
import {mockUser} from "../../mocks/data";
import {isaacApi, store} from "../../app/state";
import {Provider} from "react-redux";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import React from "react";

export const augmentErrorMessage = (message?: string) => (e: Error) => {
    return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
}

export const resetWithUserRole = (role?: Role | "ANONYMOUS") => {
    cleanup();
    server.resetHandlers();
    if (role) {
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
                    user.role = role;
                });
                return res(
                    ctx.status(200),
                    ctx.json(userWithRole)
                );
            })
        );
    }
    store.dispatch(isaacApi.util.resetApiState());
    render(<Provider store={store}>
        <IsaacApp/>
    </Provider>);
};
