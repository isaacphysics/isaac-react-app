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

const actionLogin = {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: {_id: USER_ID1}};
const actionLogout = {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS};
const actionError = {type: ACTION_TYPE.USER_CONSISTENCY_ERROR};

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
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogin);

        expect(fakeNext).toBeCalledWith(actionLogin);
        expect(setUserId).toBeCalledWith(USER_ID1);

        jest.runOnlyPendingTimers();

        expect(getUserId).toBeCalled();
    });

    it("clears the current user after logout and stops consistency checking", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogin);
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogout);

        expect(fakeNext).toBeCalledWith(actionLogin);
        expect(fakeNext).toBeCalledWith(actionLogout);
        expect(setUserId).toBeCalledWith(USER_ID1);
        expect(setUserId).toBeCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toBeCalled();
    });

    it("a change in user causes a consistency error", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogin);
        expect(fakeNext).toBeCalledWith(actionLogin);
        expect(setUserId).toBeCalledWith(USER_ID1);

        // @ts-ignore
        getUserId.mockImplementation(() => USER_ID2);

        jest.runAllTimers();

        expect(fakeDispatch).toBeCalledWith(actionError);
    });

    it("a consistency error clears the current user and stops checking", async () => {
        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogin);
        expect(fakeNext).toBeCalledWith(actionLogin);
        expect(setUserId).toBeCalledWith(USER_ID1);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionError);

        expect(fakeNext).toBeCalledWith(actionError);
        expect(setUserId).toBeCalledWith(undefined);

        jest.runAllTimers();

        expect(fakeDispatch).not.toBeCalled();
    });

    it("if setting the current user fails, does not start consistency checking", async () => {
        // @ts-ignore
        setUserId.mockImplementation(() => false);

        userConsistencyCheckerMiddleware(fakeStore)(fakeNext)(actionLogin);

        expect(fakeNext).toBeCalledWith(actionLogin);
        expect(setUserId).toBeCalledWith(USER_ID1);

        jest.runAllTimers();

        expect(getUserId).not.toHaveBeenCalled();
    });
});
