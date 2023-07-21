import 'core-js';
import {server} from "../mocks/server";
import "./matchers";

global.window.scrollTo = jest.fn();
global.window.alert = jest.fn();
global.window.confirm = jest.fn(() => true);
global.confirm = jest.fn(() => true);
global.window.HTMLElement.prototype.scrollTo = jest.fn();
global.window.HTMLElement.prototype.scrollIntoView = jest.fn();
jest.mock("react-ga4"); // Google Analytics requires a DOM.window which doesn't exist in test
jest.mock("plausible-tracker", () => jest.fn(() => ({trackPageview: jest.fn(), trackEvent: jest.fn()}))); // Plausible requires a DOM.window which doesn't exist in test
jest.mock("../app/services/websockets"); // MSW can't handle websockets just yet
jest.mock("../app/services/reactRouterExtension", () => ({
    ...jest.requireActual("../app/services/reactRouterExtension"),
    useQueryParams: jest.fn(() => ({})),
}));

// TODO jest.mock("../app/services/localStorage"); <--- need to mock this effectively

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
