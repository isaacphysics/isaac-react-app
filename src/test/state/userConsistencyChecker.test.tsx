import "../../app/state/actions"; // very annoying but this needs to be imported early to avoid a cyclic dependency issue
import {getUserId, setUserId} from "../../app/state/middleware/userConsistencyCheckerCurrentUser";
import {ACTION_TYPE} from "../../app/services/constants";
import {userConsistencyCheckerMiddleware} from "../../app/state/middleware/userConsistencyChecker";
import {AnyAction, Dispatch, MiddlewareAPI} from "redux";
import {jest} from "@jest/globals";

jest.mock("../../app/state/middleware/userConsistencyCheckerCurrentUser");

let fakeDispatch: Dispatch, fakeGetState, fakeStore: MiddlewareAPI, fakeNext: Dispatch<AnyAction>;

const USER_ID1 = "foo";
const USER_ID2 = "bar";

const loginAction = {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: {_id: USER_ID1}};
const logoutAction = {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS};
const userConsistencyErrorAction = {type: ACTION_TYPE.USER_CONSISTENCY_ERROR};
const checkForUserAction = {type: ACTION_TYPE.USER_UPDATE_REQUEST};
const checkForUserFailureAction = {type: ACTION_TYPE.USER_UPDATE_RESPONSE_FAILURE};

describe("userConsistencyCheckerMiddleware", () => {
    beforeEach(() => {
        fakeDispatch = jest.fn();
        fakeGetState = jest.fn();
        fakeStore = {dispatch: fakeDispatch, getState: fakeGetState};
        fakeNext = jest.fn();
        jest.useFakeTimers();

        // @ts-ignore
        setUserId.mockImplementation(() => true);

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
