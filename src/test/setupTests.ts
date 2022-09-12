import 'core-js';
import {server} from "../mocks/server";

global.window.scrollTo = jest.fn();
jest.mock("react-ga"); // Google Analytics requires a DOM.window which doesn't exist in test
jest.mock("../app/services/websockets"); // MSW can't handle websockets just yet

// TODO jest.mock("../app/services/localStorage"); <--- need to mock this effectively

// Establish API mocking before all tests.
beforeAll(() => {
    // Could add a callback here to deal with unhandled requests
    server.listen({onUnhandledRequest: "warn"});
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
