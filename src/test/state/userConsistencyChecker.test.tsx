import {ACTION_TYPE} from "../../app/services";
import {setUserId, getUserId, userConsistencyCheckerMiddleware, redirectTo} from "../../app/state";
import * as CurrentUser from "../../app/state/middleware/userConsistencyCheckerCurrentUser";
import * as Actions from "../../app/state/actions";
import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {createMockAPIAction} from "./utils";

jest.spyOn(CurrentUser, "setUserId");
jest.spyOn(CurrentUser, "getUserId");
jest.spyOn(Actions, "redirectTo");

let fakeDispatch: Dispatch, fakeGetState, fakeStore: MiddlewareAPI, fakeNext: Dispatch<AnyAction>;

const USER_ID1 = "foo";
const USER_ID2 = "bar";

const loginAction = createMockAPIAction("login", "mutation", "fulfilled", {_id: USER_ID1, id: USER_ID1}, {provider: "SEGUE"});
const logoutAction = createMockAPIAction("logout", "mutation", "fulfilled", undefined, undefined);
const userConsistencyErrorAction = {type: ACTION_TYPE.USER_CONSISTENCY_ERROR};
const checkForUserAction = createMockAPIAction("getCurrentUser", "query", "pending", undefined, undefined);
const checkForUserFailureAction = createMockAPIAction("getCurrentUser", "query", "rejected", undefined, undefined);

describe("userConsistencyCheckerMiddleware", () => {
    beforeEach(() => {
        fakeDispatch = jest.fn();
        fakeGetState = jest.fn();
        fakeStore = {dispatch: fakeDispatch, getState: fakeGetState};
        fakeNext = jest.fn();
        jest.useFakeTimers();

        // @ts-ignore
        setUserId.mockImplementation(() => true);
        // @ts-ignore
        redirectTo.mockImplementation(() => true);

        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it("sets the current user after a successful login and starts consistency checking", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);

        expect(fakeNext).toBeCalledWith(loginAction);
        expect(setUserId).toBeCalledWith(USER_ID1);

        jest.runOnlyPendingTimers();

        expect(getUserId).toBeCalled();
    });

    it("clears the current user after logout and stops consistency checking", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(logoutAction);

        expect(fakeNext).toBeCalledWith(loginAction);
        expect(fakeNext).toBeCalledWith(logoutAction);
        expect(setUserId).toBeCalledWith(USER_ID1);
        expect(setUserId).toBeCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toBeCalled();
    });

    it ("clears the current user if getting the current user fails", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(checkForUserAction);
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(checkForUserFailureAction);

        expect(fakeNext).toBeCalledWith(checkForUserAction);
        expect(fakeNext).toBeCalledWith(checkForUserFailureAction);

        // If we ask the back-end for the current user and that fails, we should clear any user information in local storage
        expect(setUserId).toBeCalledWith(undefined);
    })

    it("causes a consistency error if the user changes", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        expect(fakeNext).toBeCalledWith(loginAction);
        expect(setUserId).toBeCalledWith(USER_ID1);

        // @ts-ignore
        getUserId.mockImplementation(() => USER_ID2);

        jest.runAllTimers();

        expect(fakeDispatch).toBeCalledWith(userConsistencyErrorAction);
    });

    it("clears the current user and stops checking if there is a consistency error", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        expect(fakeNext).toBeCalledWith(loginAction);
        expect(setUserId).toBeCalledWith(USER_ID1);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(userConsistencyErrorAction);

        expect(fakeNext).toBeCalledWith(userConsistencyErrorAction);
        expect(setUserId).toBeCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toBeCalled();
    });

    it("does not start consistency checking if setting the current user fails", async () => {
        // @ts-ignore
        setUserId.mockImplementation(() => false);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);

        expect(fakeNext).toBeCalledWith(loginAction);
        expect(setUserId).toBeCalledWith(USER_ID1);

        jest.runAllTimers();

        expect(getUserId).not.toHaveBeenCalled();
    });
});
