import {cleanup, render, screen} from "@testing-library/react/pure";
import {Provider} from "react-redux";
import {isaacApi, store} from "../../app/state";
import React from "react";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";

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

    it('should show my number of current assignments in the navigation menu', async () => {
        const myAssignmentsBadge = await screen.findByTestId("my-assignments-badge");
        expect(myAssignmentsBadge.textContent?.includes("4")).toBeTruthy();
    });
});