import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'core-js';
import {server} from "../mocks/server";

Enzyme.configure({ adapter: new Adapter() });

global.window.scrollTo = jest.fn();
jest.mock("react-ga"); // Google Analytics requires a DOM.window which doesn't exist in test

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
