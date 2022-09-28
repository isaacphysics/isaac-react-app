// Custom jest matchers for MSW handler functions
import {DefaultBodyType, MockedResponse, RestRequest} from "msw";
import {MaybePromise} from "@reduxjs/toolkit/dist/query/tsHelpers";

expect.extend({
    async toHaveBeenRequestedWith(received: jest.MockedFn<any>, predicate: (req: RestRequest) => (Promise<boolean> | boolean)) {
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
                `No request parameters to the given handler passed the predicate. Received arguments: ${this.utils.printReceived(reqList)}`,
            pass: false,
        };
    },
    async toHaveRespondedWith(received: jest.MockedFn<any>, predicate: (res: MaybePromise<MockedResponse<DefaultBodyType>>) => (Promise<boolean> | boolean)) {
        const resList: any[] = [];
        for (const res of received.mock.results) {
            resList.push(res);
            if (await predicate(res as unknown as MaybePromise<MockedResponse<DefaultBodyType>>)) {
                return {
                    message: () => `Response ${this.utils.printReceived(res)} passed given predicate.`,
                    pass: true,
                };
            }
        }
        return {
            message: () =>
                `No responses from the given handler passed the predicate. Responses: ${this.utils.printReceived(resList)}`,
            pass: false,
        };
    },
    async toHaveBeenRequestedWithNth(received: jest.MockedFn<any>, predicate: (req: RestRequest) => (Promise<boolean> | boolean), n: number) {
        const req = received.mock.calls[n] as unknown as RestRequest | undefined;
        if (!req) {
            return {
                message: () =>
                    `Request handler has not yet been called ${n + 1} times.`,
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
                `Request with index ${n} from the given handler did not pass the predicate. Response was: ${this.utils.printReceived(req)}`,
            pass: false,
        };
    },
    async toHaveRespondedWithNth(received: jest.MockedFn<any>, predicate: (res: MaybePromise<MockedResponse<DefaultBodyType>>) => (Promise<boolean> | boolean), n: number) {
        const res = received.mock.results[n] as unknown as MaybePromise<MockedResponse<DefaultBodyType>> | undefined;
        if (!res) {
            return {
                message: () =>
                    `Request handler has not yet been called ${n + 1} times.`,
                pass: false,
            };
        }
        if (await predicate(res)) {
            return {
                message: () => `Response ${this.utils.printReceived(res)} passed given predicate.`,
                pass: true,
            };
        }
        return {
            message: () =>
                `Response with index ${n} from the given handler did not pass the predicate. Response was: ${this.utils.printReceived(res)}`,
            pass: false,
        };
    },
});
declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveBeenRequestedWith(predicate: (req: RestRequest) => (Promise<boolean> | boolean)): R;
            toHaveBeenRequestedWithNth(predicate: (req: RestRequest) => (Promise<boolean> | boolean), n: number): R;
            toHaveRespondedWith(predicate: (res: MaybePromise<MockedResponse<DefaultBodyType>>) => (Promise<boolean> | boolean)): R;
            toHaveRespondedWithNth(predicate: (res: MaybePromise<MockedResponse<DefaultBodyType>>) => (Promise<boolean> | boolean), n: number): R;
        }
    }
}
