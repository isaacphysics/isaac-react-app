import React, {RefObject, useCallback, useEffect, useRef, useState} from "react";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {NOT_FOUND} from "./";

// undefined|null checker and type guard all-in-wonder.
// Why is this not in Typescript?
export function isDefined<T>(value: T | undefined | null): value is NonNullable<T> {
    return <T>value !== undefined && <T>value !== null;
}

/**
 * A utility function to map over the values of an object, returning a new object with the same keys but transformed 
 * values.
 * 
 * @param obj The object whose values are to be transformed.
 * @param fn The function to apply to each value.
 * @returns A new object with the same keys as the input object, but with values transformed by the provided function.
 */
// Allowing `any` is the only way to achieve type safety at the call site, at the price of giving up some type safety
// in the implementation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapObject<T extends Record<string, any>, V>(obj: T, fn: (val: T[keyof T]) => V): Record<string, V> {
    return Object.fromEntries(
        Object.entries(obj).map(
            ([key, value]) => [key, fn(value)]
        )
    );
};

/**
 * Use this to wrap a function in additional logic in a type-safe way, without needing to consider the original 
 * function's call signature. Especially useful with highly polymorphic functions, as it saves you from needing to 
 * think about the decorated function's signature. Works as long as you don't need to access the original parameters.
 * 
 * Examples:
 * ```js
 * // logTwice gets the same type signature as console.log.
 * const logTwice = decorate(console.log, original => {
 *   original();
 *   original();
 * });
 * 
 * logTwice("hello");
 * 
 * // loggedPrompt gets the same type signature as window.prompt
 * const loggedPrompt = decorate(window.prompt, original => {
 *   console.log('Requesting value from user ');
 *   return original();
 * });
 *
 * loggedPrompt("Please enter the value of 'x': ");
 * ```
 *
 * @param fn The function to decorate.
 * @param cb The wrapper logic. Use the function passed into the wrapper to call the original function. `decorate` 
 *           forwards any parameters automatically.
 * @returns  A function wrapping the original function call.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decorate<T extends (...args: any) => any>(fn: T, cb: (orig: () => ReturnType<T>) => ReturnType<T>): T {
    return ((...args) => {
        return cb(() => fn(...args));
    }) as T;
};

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type ArrayElement<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;

/**
 * This function is used to check if a string contains all the words in a search phease, in any order.
 *
 * @param text The text to check.
 * @param searchPhrase The search phrase from which words are checked for in the text.
 * @returns Whether the text contains all the words in the phrase, in any order, or not.
 */
export function matchesAllWordsInAnyOrder(text: string | undefined, searchPhrase: string): boolean {
    return searchPhrase.toLowerCase().split(" ").every(word => text?.toLowerCase().includes(word.toLowerCase()));
}

/**
 * This function is used to match a string against a search phrase, in a case-insensitive manner.
 *
 * @param text The text to check.
 * @param searchPhrase The search phrase to check for in the text.
 * @returns Whether the text contains the search phrase or not.
 */
export function matchesNameSubstring(firstName: string | undefined, lastName: string | undefined, searchPhrase: string): boolean {
    const search = searchPhrase.toLowerCase().replaceAll(" ", "").replaceAll(".", "");
    if (firstName) {
        return (firstName.toLowerCase() + lastName?.toLowerCase()).includes(search) ||
            (firstName[0].toLowerCase() + lastName?.toLowerCase()).includes(search);
    }
    return lastName?.toLowerCase().includes(searchPhrase.toLowerCase()) ?? false;
}

/**
 * This provides a simple interface for post message passing in-between domains.
 *
 * @param uid               Unique identifier of this particular message conversation
 * @param iFrameRef         A React RefObject pointing to an iframe. If this is undefined, the hook
 *                          will wait for the first message that has data in the correct format, and
 *                          then send messages to that domain.
 * @param replyCallback     An optional callback which lets you reply to incoming messages via the
 *                          MessageEventSource. Should be a callback that takes the returned object.
 */
export function useIFrameMessages(uid: string, iFrameRef?: RefObject<HTMLIFrameElement>, replyCallback?: (data: Record<string, unknown>) => (Record<string, unknown> | void)): {receivedData: Record<string, unknown> | undefined, sendMessage: (obj: Record<string, unknown>) => void} {

    const uidRef = useRef(uid);

    const [receivedData, setReceivedData] = useState(undefined);

    const [targetDomainSource, setTargetDomainSource] = useState<MessageEventSource>();
    const [targetDomainOrigin, setTargetDomainOrigin] = useState<string>();

    const sendMessage = useCallback((obj: Record<string, unknown>) => {

        obj.uid = uidRef.current;

        if (typeof iFrameRef === 'object' && iFrameRef?.current) {
            iFrameRef.current.contentWindow?.postMessage(obj, iFrameRef.current.src);
        } else if (undefined !== targetDomainSource && undefined !== targetDomainOrigin) {
            // @ts-ignore
            targetDomainSource.postMessage(obj, targetDomainOrigin);
        } else {
            // This should only happen if undefined foreignDomain and no message is received yet
            console.log("If foreignDomain is undefined, useIFrameMessages can only reply to messages (i.e. can send only after the first message has been received)");
        }
    }, [targetDomainSource, targetDomainOrigin, uidRef]);

    const handleReceive = useCallback((e: MessageEvent) => {
        // Make sure we ignore messages from this domain
        if (e.origin === window.origin) return;

        // Make sure that the data is what we expect, and that it has a correct uid
        if (!(typeof e.data === 'object' && e.data !== null && !Array.isArray(e.data) && e.data.hasOwnProperty('uid')
            && e.data.uid === uidRef.current)) {
            return;
        }

        if (e.data.hasOwnProperty('type')) {
            if (!targetDomainSource) {
                setTargetDomainSource(e.source as MessageEventSource);
                setTargetDomainOrigin(e.origin);
            }
            setReceivedData(e.data);
            if (replyCallback && e.source) {
                e.source.postMessage(replyCallback(e.data));
            }
        }
    },[uidRef, replyCallback, setReceivedData, iFrameRef, targetDomainSource, setTargetDomainSource, setTargetDomainOrigin]);

    useEffect(() => {
        window.addEventListener('message', handleReceive);
        return () => {
            window.removeEventListener('message', handleReceive);
        };
    }, [handleReceive]);

    return {receivedData, sendMessage};
}

// Type guard with checks for "defined"-ness and whether the resource was found or not
export const isFound = <T>(resource: undefined | null | NOT_FOUND_TYPE | T): resource is NonNullable<T> => {
    return isDefined(resource) && resource !== NOT_FOUND;
};

// Adapted from answer to stackoverflow.com/questions/32553158
// I'm not sure what the types need to be for contains() to be happy
// Could also look at https://github.com/airbnb/react-outside-click-handler
export function useOutsideCallback(ref: RefObject<any>, callback : () => void, deps : React.DependencyList) {
    useEffect(() => {
        /**
         * Run callback if clicked outside element
         */
        function handleClickOutside(event: Event) {
            if (ref?.current && !ref.current.contains(event.target)) {
                callback();
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [...deps, ref]);
}


export function noop(_: never) {}

// Confirms (currently using `window.confirm`, but we could change that to a more Isaac/Ada-themed thing moving
// forwards) that the user would like to perform an action, given a particular prompt.
//
// Depending on whether they confirm or not, the confirmCallback or cancelCallback is run.
//
// Will return whatever value the callbacks return.
export const confirmThen = <T, R>(prompt: string, confirmCallback: () => T, cancelCallback?: () => R): T | R | undefined => {
    const confirmed = window.confirm(prompt);
    if (confirmed) {
        return confirmCallback();
    }
    return cancelCallback?.();
};

export const interleave = <T>(...lists: T[][]): T[] => {
    const maxLength = Math.max(...lists.map(list => list.length));
    const result = [];
    for (let i = 0; i < maxLength; i++) {
        for (const list of lists) {
            if (list[i] !== undefined) {
                result.push(list[i]);
            }
        }
    }
    return result;
};

export const nonemptyOrUndefined = <T>(arr: T[] | undefined): T[] | undefined => {
    if (arr && arr.length === 0) {
        return undefined;
    }
    return arr;
};

export const nextRandom = () => Math.random();

export const nextSeed = () => Math.floor(Math.floor(nextRandom() * 10 ** 6));
