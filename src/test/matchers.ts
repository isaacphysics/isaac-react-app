// Custom jest matchers for MSW handler functions
import { RestRequest } from "msw";
import { within } from "@testing-library/react";

expect.extend({
  async toHaveBeenRequestedWith(
    received: jest.MockedFn<any>,
    predicate: (req: RestRequest) => Promise<boolean> | boolean,
  ) {
    const reqList: any[] = [];
    for (const call of received.mock.calls) {
      const req = call[0] as RestRequest;
      reqList.push(req);
      if (await predicate(req)) {
        return {
          message: () => `Request ${this.utils.printReceived(req)} passed given predicate.`,
          pass: true,
        };
      }
    }
    return {
      message: () =>
        `No request parameters to the given handler passed the predicate. Received arguments: ${this.utils.printReceived(
          reqList,
        )}`,
      pass: false,
    };
  },
  async toHaveBeenRequestedWithNth(
    received: jest.MockedFn<any>,
    predicate: (req: RestRequest) => Promise<boolean> | boolean,
    n: number,
  ) {
    const req = received.mock.calls[n] as unknown as RestRequest | undefined;
    if (!req) {
      return {
        message: () => `Request handler has not yet been called ${n + 1} times.`,
        pass: false,
      };
    }
    if (await predicate(req)) {
      return {
        message: () => `Request ${this.utils.printReceived(req)} passed given predicate.`,
        pass: true,
      };
    }
    return {
      message: () =>
        `Request with index ${n} from the given handler did not pass the predicate. Response was: ${this.utils.printReceived(
          req,
        )}`,
      pass: false,
    };
  },
  toHaveModalTitle(recieved: HTMLElement, title: string) {
    const modalHeader = within(recieved).queryByTestId("modal-header");
    if (!modalHeader) {
      return {
        pass: false,
        message: () => `Expected modal title element, but could not find one!`,
      };
    }
    const pass = !!within(modalHeader).queryByRole("heading", { name: title });
    return {
      pass,
      message: () =>
        `Expected title to contain: ${this.utils.printExpected(title)}\nReceived: ${this.utils.printReceived(
          modalHeader?.textContent,
        )}${!pass ? `\n\n${this.utils.diff(title, modalHeader?.textContent)}` : ""}`,
    };
  },
});
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenRequestedWith(predicate: (req: RestRequest) => Promise<boolean> | boolean): R;
      toHaveBeenRequestedWithNth(predicate: (req: RestRequest) => Promise<boolean> | boolean, n: number): R;
      toHaveModalTitle(title: string): R;
    }
  }
}
