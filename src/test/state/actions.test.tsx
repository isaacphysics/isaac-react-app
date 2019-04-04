import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {registerQuestion, requestCurrentUser} from "../../app/state/actions";
import {ActionType} from "../../IsaacAppTypes";
import {questionDTOs, registeredUserDTOs} from "../test-factory";
import {endpoint} from "../../app/services/api";

const middleware = [thunk];
const mockStore = configureMockStore(middleware);
const axiosMock = new MockAdapter(endpoint);

describe("requestCurrentUser action", async () => {
    afterEach(() => {
        axiosMock.restore();
    });

    it("asynchronously dispatch user log in response success action on successful get request", async () => {
        const {dameShirley} = registeredUserDTOs;
        axiosMock.onGet(`/users/current_user`).reply(200, dameShirley);
        const store = mockStore();
        await store.dispatch(requestCurrentUser() as any);
        const expectedActions = [
            {type: ActionType.USER_UPDATE_REQUEST},
            {type: ActionType.USER_LOG_IN_RESPONSE_SUCCESS, user: dameShirley}
        ];
        expect(store.getActions()).toEqual(expectedActions);
    })
});

describe("registerQuestion action", () => {
    it("dispatches a question registration action", () => {
        const {manVsHorse} = questionDTOs;
        const expectedActions = [{type: ActionType.QUESTION_REGISTRATION, question: manVsHorse}];
        const store = mockStore();
        store.dispatch(registerQuestion(manVsHorse) as any);
        expect(store.getActions()).toEqual(expectedActions);
    });
});
