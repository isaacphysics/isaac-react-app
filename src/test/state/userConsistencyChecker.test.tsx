import {ACTION_TYPE} from "../../app/services";
import {setUserId, getUserId, userConsistencyCheckerMiddleware, redirectTo} from "../../app/state";
import * as CurrentUser from "../../app/state/middleware/userConsistencyCheckerCurrentUser";
import * as Actions from "../../app/state/actions";
import {AnyAction, Dispatch, MiddlewareAPI} from "redux";

jest.spyOn(CurrentUser, "setUserId");
jest.spyOn(CurrentUser, "getUserId");
jest.spyOn(Actions, "redirectTo");

let fakeDispatch: Dispatch, fakeGetState, fakeStore: MiddlewareAPI, fakeNext: Dispatch<AnyAction>;

const USER_ID1 = "foo";
const USER_ID2 = "bar";

const loginAction = {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, authResponse: {id: USER_ID1}};
const logoutAction = {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS};
const userConsistencyErrorAction = {type: ACTION_TYPE.USER_CONSISTENCY_ERROR};
const checkForUserAction = {type: ACTION_TYPE.CURRENT_USER_REQUEST};
const checkForUserFailureAction = {type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE};

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

        expect(fakeNext).toHaveBeenCalledWith(loginAction);
        expect(setUserId).toHaveBeenCalledWith(USER_ID1);

        jest.runOnlyPendingTimers();

        expect(getUserId).toHaveBeenCalled();
    });

    it("clears the current user after logout and stops consistency checking", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(logoutAction);

        expect(fakeNext).toHaveBeenCalledWith(loginAction);
        expect(fakeNext).toHaveBeenCalledWith(logoutAction);
        expect(setUserId).toHaveBeenCalledWith(USER_ID1);
        expect(setUserId).toHaveBeenCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toBeCalled();
    });

    it ("clears the current user if getting the current user fails", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(checkForUserAction);
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(checkForUserFailureAction);

        expect(fakeNext).toHaveBeenCalledWith(checkForUserAction);
        expect(fakeNext).toHaveBeenCalledWith(checkForUserFailureAction);

        // If we ask the back-end for the current user and that fails, we should clear any user information in local storage
        expect(setUserId).toHaveBeenCalledWith(undefined);
    });

    it("causes a consistency error if the user changes", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        expect(fakeNext).toHaveBeenCalledWith(loginAction);
        expect(setUserId).toHaveBeenCalledWith(USER_ID1);

        // @ts-ignore
        getUserId.mockImplementation(() => USER_ID2);

        jest.runAllTimers();

        expect(fakeDispatch).toHaveBeenCalledWith(userConsistencyErrorAction);
    });

    it("clears the current user and stops checking if there is a consistency error", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);
        expect(fakeNext).toHaveBeenCalledWith(loginAction);
        expect(setUserId).toHaveBeenCalledWith(USER_ID1);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(userConsistencyErrorAction);

        expect(fakeNext).toHaveBeenCalledWith(userConsistencyErrorAction);
        expect(setUserId).toHaveBeenCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toHaveBeenCalled();
    });

    it("does not start consistency checking if setting the current user fails", async () => {
        // @ts-ignore
        setUserId.mockImplementation(() => false);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(loginAction);

        expect(fakeNext).toHaveBeenCalledWith(loginAction);
        expect(setUserId).toHaveBeenCalledWith(USER_ID1);

        jest.runAllTimers();

        expect(getUserId).not.toHaveBeenCalled();
    });
});
