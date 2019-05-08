import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {registerQuestion, requestConstantsUnits, requestCurrentUser} from "../../app/state/actions";
import {endpoint} from "../../app/services/api";
import {errorResponses, questionDTOs, registeredUserDTOs, unitsList} from "../test-factory";
import {ACTION_TYPES} from "../../app/services/constants";

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
const axiosMock = new MockAdapter(endpoint);

describe("requestCurrentUser action", () => {
    afterEach(() => {
        axiosMock.reset();
    });

    it("dispatches USER_LOG_IN_RESPONSE_SUCCESS after a successful request", async () => {
        const {dameShirley} = registeredUserDTOs;
        axiosMock.onGet(`/users/current_user`).replyOnce(200, dameShirley);
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPES.USER_UPDATE_REQUEST},
            {type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: dameShirley}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("dispatches USER_UPDATE_FAILURE on a 401 response", async () => {
        const {mustBeLoggedIn401} = errorResponses;
        axiosMock.onGet(`/users/current_user`).replyOnce(401, mustBeLoggedIn401);
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPES.USER_UPDATE_REQUEST},
            {type: ACTION_TYPES.USER_UPDATE_FAILURE}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("dispatches USER_UPDATE_FAILURE when no connection to the api", async () => {
        axiosMock.onGet(`/users/current_user`).networkError();
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPES.USER_UPDATE_REQUEST},
            {type: ACTION_TYPES.USER_UPDATE_FAILURE}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("does not care if the response times-out", async () => {
        axiosMock.onGet(`/users/current_user`).timeout();
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ACTION_TYPES.USER_UPDATE_REQUEST},
            {type: ACTION_TYPES.USER_UPDATE_FAILURE}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });
});

describe("registerQuestion action", () => {
    it("dispatches a question registration action", () => {
        const {manVsHorse} = questionDTOs;
        const expectedActions = [{type: ACTION_TYPES.QUESTION_REGISTRATION, question: manVsHorse}];
        const store = mockStore();
        store.dispatch(registerQuestion(manVsHorse) as any);
        expect(store.getActions()).toEqual(expectedActions);
    });
});

describe("requestConstantsUnits action", () => {
    afterEach(() => {
        axiosMock.reset();
    });

    it("dispatches CONSTANTS_UNITS_RESPONSE_SUCCESS after a successful request", async () => {
        axiosMock.onGet(`/content/units`).replyOnce(200, unitsList);
        const store = mockStore();
        await store.dispatch(requestConstantsUnits() as any);
        const expectedActions = [
            {type: ACTION_TYPES.CONSTANTS_UNITS_REQUEST},
            {type: ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_SUCCESS, units: unitsList}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("doesn't dispatch CONSTANTS_UNITS_REQUEST if already in the store", async () => {
        const store = mockStore({constants: {units: unitsList}});
        await store.dispatch(requestConstantsUnits() as any);
        expect(store.getActions().length).toBe(0);
        expect(axiosMock.history.get.length).toBe(0);
    });

    it("dispatches USER_UPDATE_FAILURE when no connection to the api", async () => {
        axiosMock.onGet(`/content/units`).networkError();
        const store = mockStore();
        await store.dispatch(requestConstantsUnits() as any);
        const expectedActions = [
            {type: ACTION_TYPES.CONSTANTS_UNITS_REQUEST},
            {type: ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_FAILURE}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });

    it("does not care if the response times-out", async () => {
        axiosMock.onGet(`/content/units`).timeout();
        const store = mockStore();
        await store.dispatch(requestConstantsUnits() as any);
        const expectedActions = [
            {type: ACTION_TYPES.CONSTANTS_UNITS_REQUEST},
            {type: ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_FAILURE}
        ];
        expect(store.getActions()).toEqual(expectedActions);
        expect(axiosMock.history.get.length).toBe(1);
    });
});
