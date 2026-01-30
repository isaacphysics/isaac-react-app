// scrollManager access this as it's interpreted, so the mocking 
// needs to happen before it's imported
global.window.scrollTo = jest.fn();

import 'core-js';
import '@testing-library/jest-dom';
import {server} from "../mocks/server";
import "./matchers";

global.window.alert = jest.fn();
global.window.confirm = jest.fn(() => true);
global.confirm = jest.fn(() => true);
global.window.HTMLElement.prototype.scrollTo = jest.fn();
global.window.HTMLElement.prototype.scrollIntoView = jest.fn();
jest.mock("plausible-tracker", () => jest.fn(() => ({trackPageview: jest.fn(), trackEvent: jest.fn()}))); // Plausible requires a DOM.window which doesn't exist in test
jest.mock("../app/services/websockets"); // MSW can't handle websockets just yet

// TODO mock localStorage and sessionStorage like this (currently broken for some reason)
//
// // Repeating this definition here so we don't have to import it from services
// export enum KEY {
//     AFTER_AUTH_PATH = "afterAuthPath",
//     CURRENT_USER_ID = "currentUserId",
//     FIRST_LOGIN = "firstLogin",
//     REQUIRED_MODAL_SHOWN_TIME = "requiredModalShownTime",
//     RECONFIRM_USER_CONTEXT_SHOWN_TIME = "reconfirmStageExamBoardShownTime",
//     LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME = "loginOrSignUpModalShownTime",
//     LAST_NOTIFICATION_TIME = "lastNotificationTime",
//     ANONYMISE_USERS = "anonymiseUsers",
//     ANONYMISE_GROUPS = "anonymiseGroups",
//     MOST_RECENT_ALL_TOPICS_PATH = "mostRecentAllTopicsPath",
//     FIRST_ANON_QUESTION = "firstAnonQuestion",
//     ASSIGN_BOARD_PATH = "assignBoardPath",
// }
//
// let mockSessionStorage: {[key: string]: string} = {};
// let mockLocalStorage: {[key: string]: string} = {};
//
// global.window.sessionStorage.removeItem = jest.fn((key: string) => {
//     delete mockSessionStorage[key];
// });
// global.window.sessionStorage.getItem = jest.fn((key: string) => {
//     return mockSessionStorage[key];
// });
// global.window.sessionStorage.setItem = jest.fn((key: string, value: string) => {
//     mockSessionStorage[key] = value;
// });
// global.window.sessionStorage.clear = jest.fn(() => {
//     mockSessionStorage = {};
// });
// global.window.localStorage.removeItem = jest.fn((key: string) => {
//     delete mockLocalStorage[key];
// });
// global.window.localStorage.getItem = jest.fn((key: string) => {
//     return mockLocalStorage[key];
// });
// global.window.localStorage.setItem = jest.fn((key: string, value: string) => {
//     mockLocalStorage[key] = value;
// });
// global.window.localStorage.clear = jest.fn(() => {
//     mockLocalStorage = {};
// });
//
// jest.mock("../app/services/localStorage", () => ({
//     ...jest.requireActual("../app/services/localStorage"),
//     persistence: {
//         ...jest.requireActual("../app/services/localStorage").persistence,
//         load: jest.fn((key: string) => {
//             return mockLocalStorage[key];
//         }),
//         save: jest.fn((key: string, value: string) => {
//             mockLocalStorage[key] = value;
//         })
//     }
// }));

jest.setTimeout(10000); // 10 seconds (default is 5 seconds)

// Establish API mocking before all tests.
beforeAll(() => {
    // Could add a callback here to deal with unhandled requests
    server.listen({onUnhandledRequest: "warn"});
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
});
// Clean up after the tests are finished.
afterAll(() => server.close());
