import React, {RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {NOT_FOUND} from "./";

// undefined|null checker and type guard all-in-wonder.
// Why is this not in Typescript?
export function isDefined<T>(value: T | undefined | null): value is NonNullable<T> {
    return <T>value !== undefined && <T>value !== null;
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
        }
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
    useLayoutEffect(() => {
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(x: never) {}