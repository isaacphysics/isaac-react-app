import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';

import thunk from "redux-thunk";
import {
    fetchErrorFromParameters,
    middleware,
    registerQuestions,
    requestCurrentUser,
    showToast
} from "../../app/state";
import {endpoint} from "../../app/services";
import {
    errorResponses,
    questionDTOs,
    registeredUserDTOs,
    userAuthenticationSettings,
    userPreferencesSettings
} from "../test-factory";
import {ACTION_TYPE} from "../../app/services";
import {Action} from "../../IsaacAppTypes";
import {jest} from "@jest/globals";
import {SOME_FIXED_FUTURE_DATE_AS_STRING} from "../dateUtils";

const mockStore = configureMockStore([thunk, ...middleware]);
const axiosMock = new MockAdapter(endpoint as any);
const middlewareRegistrationActions = [{type: 'isaacApi/config/middlewareRegistered', payload: 'some unique string'}];

function expectActionsToStartWithMiddlewareRegistration(actualActions: Action[]): Action[] {
    expect(actualActions.slice(0, middlewareRegistrationActions.length).map(a => a.type)).toEqual(['isaacApi/config/middlewareRegistered']);
    return actualActions.slice(middlewareRegistrationActions.length);
}

describe("middleware",  () => {
    it("returns any value that the action returns", async () => {
        const store = mockStore();
        const expectedResult = 1;
        const actualResult = await store.dispatch((() => expectedResult) as any);
        expect(actualResult).toEqual(expectedResult);
    });
});

describe("requestCurrentUser action", () => {
    afterEach(() => {
        axiosMock.reset();
    });

    it("dispatches USER_LOG_IN_RESPONSE_SUCCESS after a successful request", async () => {
        const {dameShirley} = registeredUserDTOs;
        const userAuthSettings = userAuthenticationSettings[dameShirley.id as number];
        const userPreferences = userPreferencesSettings[dameShirley.id as number];

        axiosMock.onGet(`/users/current_user`).replyOnce(200, dameShirley,
            {"x-session-expires": SOME_FIXED_FUTURE_DATE_AS_STRING});
        axiosMock.onGet(`/auth/user_authentication_settings`).replyOnce(200, userAuthSettings);
        axiosMock.onGet(`/users/user_preferences`).replyOnce(200, userPreferences);

        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedFirstActions = [{type: ACTION_TYPE.CURRENT_USER_REQUEST}];
        const expectedAsyncActions = [
            {type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST},
            {type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS, userAuthSettings},
            {type: ACTION_TYPE.USER_PREFERENCES_REQUEST},
            {type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS, userPreferences}
        ];
        const expectedFinalActions = [
            {type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, user: {...dameShirley, loggedIn: true, sessionExpiry: 2525860800000}}
        ];

        const actualActions = store.getActions();

        const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions.length)
            .toEqual(expectedFirstActions.length + expectedAsyncActions.length + expectedFinalActions.length);
        expect(actualIsaacActions.slice(0, expectedFirstActions.length)).toEqual(expectedFirstActions);
        expectedAsyncActions.forEach(expectedAsyncAction => {
            expect(actualIsaacActions.slice(expectedFirstActions.length, -expectedFinalActions.length))
                .toContainEqual(expectedAsyncAction);
        });
        expect(actualIsaacActions.slice(-expectedFinalActions.length)).toEqual(expectedFinalActions);
        expect(axiosMock.history.get.length).toBe(3);
    });

    it("dispatches USER_UPDATE_RESPONSE_FAILURE on a 401 response", async () => {
        const {mustBeLoggedIn401} = errorResponses;
        axiosMock.onGet(`/users/current_user`).replyOnce(401, mustBeLoggedIn401);
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPE.CURRENT_USER_REQUEST},
            {type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE}
        ];
        const actualActions = store.getActions();
        const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("dispatches USER_UPDATE_RESPONSE_FAILURE when no connection to the api", async () => {
        axiosMock.onGet(`/users/current_user`).networkError();
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPE.CURRENT_USER_REQUEST},
            {type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE}
        ];
        const actualActions = store.getActions();
        const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("does not care if the response times-out", async () => {
        axiosMock.onGet(`/users/current_user`).timeout();
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPE.CURRENT_USER_REQUEST},
            {type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE}
        ];
        const actualActions = store.getActions();
        const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });
});

describe("registerQuestion action", () => {
    it("dispatches a question registration action", () => {
        const {manVsHorse} = questionDTOs;
        const expectedActions = [{type: ACTION_TYPE.QUESTION_REGISTRATION, questions: [manVsHorse]}];
        const store = mockStore();
        store.dispatch(registerQuestions([manVsHorse]) as any);
        const actualActions = store.getActions();
        const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
    });
});

describe("toasts actions", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllTimers();
    });

    const someTimedToast = {
        color: "success",
        title: "Title",
        body: "Body",
        timeout: 1000
    };

    const someUnTimedToast = {
        color: "success",
        title: "Title",
        body: "Body"
    };

    it("registers an action to hide and remove the toast if a timeout is set", async () => {
        const store = mockStore();
        const toastId: string = await store.dispatch(showToast(someTimedToast) as any);
        const expectedActions: Action[] = [
            {type: ACTION_TYPE.TOASTS_SHOW, toast: someTimedToast}
        ];
        let actualActions = store.getActions();
        let actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);

        jest.runOnlyPendingTimers();
        expectedActions.push(
            {type: ACTION_TYPE.TOASTS_HIDE, toastId: toastId}
        );
        actualActions = store.getActions();
        actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);

        jest.runOnlyPendingTimers();
        expectedActions.push(
            {type: ACTION_TYPE.TOASTS_REMOVE, toastId}
        );
        actualActions = store.getActions();
        actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);

        jest.runOnlyPendingTimers();
        actualActions = store.getActions();
        actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
    });

    it("does not register any actions related to the toast if a timeout is not set", async () => {
        const store = mockStore();
        const toastId: string = await store.dispatch(showToast(someUnTimedToast) as any);
        const expectedActions: Action[] = [
            {type: ACTION_TYPE.TOASTS_SHOW, toast: someUnTimedToast}
        ];
        let actualActions = store.getActions();
        let actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);

        jest.runOnlyPendingTimers();
        actualActions = store.getActions();
        actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
        expect(actualIsaacActions).toEqual(expectedActions);
    });
});

// TODO remake these as full "front-end integration" tests
// describe("requestEmailVerification action", () => {
//     afterEach(() => {
//         axiosMock.reset();
//     });
//
//     const {profWheeler} = registeredUserDTOs;
//
//     it("dispatches failure and a failure toast if not logged in", async () => {
//         const store = mockStore();
//         await store.dispatch(requestEmailVerification() as any);
//         const expectedActions = [
//             {type: ACTION_TYPE.TOASTS_SHOW},
//             {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE}
//         ];
//         const actualActions = store.getActions();
//         const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
//         expect(actualIsaacActions).toMatchObject(expectedActions);
//         expect(axiosMock.history.get.length).toBe(0);
//     });
//
//     it("success dispatches request, success, and a toast if logged in", async () => {
//         axiosMock.onPost(`/users/verifyemail`).replyOnce(200);
//         const store = mockStore({user: {...profWheeler, loggedIn: true}});
//         await store.dispatch(requestEmailVerification() as any);
//         const expectedActions = [
//             {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_REQUEST},
//             {type: ACTION_TYPE.TOASTS_SHOW},
//             {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_SUCCESS}
//         ];
//         const actualActions = store.getActions();
//         const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
//         expect(actualIsaacActions).toMatchObject(expectedActions);
//         expect(axiosMock.history.post.length).toBe(1);
//     });
//
//     it("failure dispatches request, failure, and a toast if logged in", async () => {
//         axiosMock.onPost(`/users/verifyemail`).replyOnce(500, {bypassGenericSiteErrorPage: true});
//         const store = mockStore({user: {...profWheeler, loggedIn: true}});
//         await store.dispatch(requestEmailVerification() as any);
//         const expectedActions = [
//             {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_REQUEST},
//             {type: ACTION_TYPE.TOASTS_SHOW},
//             {type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE}
//         ];
//         const actualActions = store.getActions();
//         const actualIsaacActions = expectActionsToStartWithMiddlewareRegistration(actualActions);
//         expect(actualIsaacActions).toMatchObject(expectedActions);
//         expect(axiosMock.history.post.length).toBe(1);
//     });
//
// });

describe('helper: fetchErrorPromParameters', () => {
    const parametersString = ({error, errorDescription} : { error?: string, errorDescription?: string} = {}) =>
        (error ? `?error=${error}` : '') + 
        (errorDescription ? "&error_description=The%20user%20has%20denied%20access.": '') + 
        "&state=some_state";

    it('parses error and description when both present, skips anything else', () => {
        const url = parametersString({ error: 'access_denied', errorDescription: 'The%20user%20has%20denied%20access.'});
        const result = fetchErrorFromParameters(url);
        expect(result).toEqual({ error: 'access_denied', errorDescription: "The user has denied access."});
    });

    it('skips error when that\'s missing', () => {
        const url = parametersString({ errorDescription: 'The%20user%20has%20denied%20access.'});
        const result = fetchErrorFromParameters(url);
        expect(result).toEqual({ errorDescription: "The user has denied access."});
    });

    it('skips description when that\'s missing', () => {
        const url = parametersString({ error: 'access_denied'});
        const result = fetchErrorFromParameters(url);
        expect(result).toEqual({ error: "access_denied"});
    });

    it('returns object when both missing', () => {
        const result = fetchErrorFromParameters(parametersString());
        expect(result).toEqual({ });
    });

    it('returns parseError on parsing error', () => {
        //@ts-ignore
        const result = fetchErrorFromParameters(['a', 1, true]);
        expect(result).toEqual({ parseError: 'Failed to parse "a,1,true". Each query pair must be an iterable [name, value] tuple'});
    });
});
