import {useCallback, useState} from "react";
import {useGlossaryTermsInHtml} from "./GlossaryTerms";
import {useAccessibleTablesInHtml} from "./Tables";
import {useClozeDropRegionsInHtml} from "./InlineDropZones";

export type PortalInHtmlHook = (html: string) => [string, (ref?: HTMLElement) => JSX.Element[]];

// These are the hooks that the Table component is allowed to use
export const TABLE_COMPATIBLE_PORTAL_HOOKS: PortalInHtmlHook[] = [
    useClozeDropRegionsInHtml,
    useGlossaryTermsInHtml
];

export const PORTAL_HOOKS: PortalInHtmlHook[] = [
    useAccessibleTablesInHtml,
    useClozeDropRegionsInHtml,
    useGlossaryTermsInHtml
];

// This looks nasty since it calls other hooks in a loop, but as long as the same hooks are called in the same order each
// time, React is perfectly happy with it.
// For this to be guaranteed, **the parameter `hookList` MUST STAY CONSTANT** (i.e. either use one of the `portalHooks` constants
// above or define an array inline, but make sure that you don't modify the array at any point)
export function usePortalInHtmlHooks(html: string, hookList?: PortalInHtmlHook[]): [string, (ref?: HTMLElement) => JSX.Element[]] {
    const renderFuncs: ((ref?: HTMLElement) => JSX.Element[])[] = [];

    hookList?.forEach(hook => {
        const [modifiedHtml, func] = hook(html);
        renderFuncs.push(func);
        html = modifiedHtml;
    });

    return [
        html,
        ref => renderFuncs.flatMap<JSX.Element>(func => func(ref))
    ];
}

// This is a hook that abstracts the callback ref pattern, allowing for updates to a refs value (specifically one
// referring to an element) to cause component updates
export function useStatefulElementRef<T>(): [T | undefined, (ref: any) => void] {
    const [ ref, setRef ] = useState<T>();
    const updateRef = useCallback(ref => {
        if (ref !== null) {
            setRef(ref);
        }
    }, []);
    return [ref, updateRef];
}