import React, {RefObject, useCallback, useEffect, useRef, useState} from "react";
import uuid from "uuid";

// undefined|null checker and type guard all-in-wonder.
// Why is this not in Typescript?
export function isDefined<T>(value: T | undefined | null): value is T {
    return <T>value !== undefined && <T>value !== null;
}


/**
 * This provides a simple interface for post message passing in-between domains.
 *
 * @param foreignDomain     Either a React RefObject pointing to an iframe, or string URL of foreign
 *                          domain to talk to
 * @param uid               Unique identifier of this particular message conversation
 * @param replyCallback     An optional callback which lets you reply to incoming messages via the
 *                          MessageEventSource. Should be a callback that takes the returned object.
 */
export function useIFrameMessages(foreignDomain: RefObject<HTMLIFrameElement> | string, uid: string, replyCallback?: (data: Record<string, unknown>) => (Record<string, unknown> | void)): {receivedData: Record<string, unknown> | undefined, sendMessage: (obj: Record<string, unknown>) => void} {

    const uidRef = useRef(uid);

    const [receivedData, setReceivedData] = useState(undefined);

    const [targetDomain, setTargetDomain] = useState<MessageEventSource | null>(null);

    const sendMessage = useCallback((obj: Record<string, unknown>) => {

        obj.uid = uidRef.current;

        if (typeof foreignDomain === 'object' && foreignDomain?.current) {
            foreignDomain.current.contentWindow?.postMessage(obj, foreignDomain.current.src);
        } else if (typeof foreignDomain === 'string' && null !== targetDomain) {
            // @ts-ignore
            targetDomain.postMessage(obj, foreignDomain);
        } else {
            // This should only happen if a string foreignDomain hasn't received a message yet
            console.log("If foreignDomain of type string, useIFrameMessages can only reply to messages (i.e. can send only after the first message has been received)");
        }
    }, [targetDomain]);

    window.addEventListener('message', e => {
        // We need an iframe reference for this to work
        const requiredDomain: string | undefined = typeof foreignDomain === 'object' ? foreignDomain?.current?.src : foreignDomain;

        // Make sure we only listen to messages from where we want to
        if (e.origin !== requiredDomain) return;

        // Make sure that the data is what we expect, and that it has a correct uid
        if (!(typeof e.data === 'object' && e.data !== null && !Array.isArray(e.data) && e.data.hasOwnProperty('uid')
            && e.data.ui === uidRef.current)) {
            return;
        }

        if (e.data.hasOwnProperty('type')) {
            if (null === targetDomain) setTargetDomain(e.source);
            setReceivedData(e.data);
            if (replyCallback && e.source) {
                e.source.postMessage(replyCallback(e.data));
            }
        }
    });

    return {receivedData, sendMessage};
}


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