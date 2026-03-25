// jest.polyfills.js
/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.

 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */
 
import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream, TransformStream } from 'node:stream/web';
import { performance } from 'node:perf_hooks';
 
Object.defineProperties(globalThis, {
    TextDecoder: { value: TextDecoder },
    TextEncoder: { value: TextEncoder },
    ReadableStream: { value: ReadableStream },
    TransformStream: { value: TransformStream },
    performance: { value: performance, writable: true }, // writeable for jest fake timers
});

globalThis.ResizeObserver = class MockResizeObserver {
    constructor(_callback) {}
    observe() {}
    disconnect() {}
}
