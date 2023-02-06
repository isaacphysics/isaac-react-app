import {useCallback, useState} from "react";
import {useGlossaryTermsInHtml} from "./GlossaryTerms";
import {useAccessibleTablesInHtml} from "./Tables";
import {useClozeDropRegionsInHtml} from "./renderClozeDropRegions";
import {useInlineQuestionsInHtml} from "./renderInlineQuestions";

export type PortalInHtmlHook = (html: string) => [string, (ref?: HTMLElement) => JSX.Element[]];

// These are the hooks that the Table component is allowed to use
export const TABLE_COMPATIBLE_PORTAL_HOOKS: PortalInHtmlHook[] = [
    useClozeDropRegionsInHtml,
    useInlineQuestionsInHtml,
    useGlossaryTermsInHtml
];

// These hooks all follow the `PortalInHtmlHook` interface, which should be used as follows:
// - The html produced by a `PortalInHtmlHook` (the first result) should be rendered within an element using the `dangerouslySetInnerHTML` attribute.
//   Call this the root element.
// - When calling the function returned from a `PortalInHtmlHook` (the second result), **pass the root element** using the `useStatefulElementRef`
//   hook. This means that when the root element is added to the DOM, a update occurs for all components that take that element as a prop.
//
// Using this pattern, you can safely nest portal components to an arbitrary depth (as far as I can tell)
export const PORTAL_HOOKS: PortalInHtmlHook[] = [
    useAccessibleTablesInHtml,
    useClozeDropRegionsInHtml,
    useInlineQuestionsInHtml,
    useGlossaryTermsInHtml
];

// This looks nasty since it calls other hooks in a loop, but as long as the same hooks are called in the same order each
// time, React is perfectly happy with it.
// For this to be guaranteed, **the parameter `hookList` MUST STAY CONSTANT** (i.e. either use one of the `portalHooks` constants
// above or define an array inline, but make sure that you don't modify the array at any point). Most use cases should only
// need the predefined hooks below this.
const portalsInHtmlHookBuilder = (hookList?: PortalInHtmlHook[]): PortalInHtmlHook => function (html: string): [string, (ref?: HTMLElement) => JSX.Element[]] {
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
export const usePortalsInHtml = portalsInHtmlHookBuilder(PORTAL_HOOKS);
export const useTableCompatiblePortalsInHtml = portalsInHtmlHookBuilder(TABLE_COMPATIBLE_PORTAL_HOOKS);

// This is a hook that abstracts the callback ref pattern, allowing for updates to a refs value (specifically one
// referring to an element) to cause component updates
export function useStatefulElementRef<T>(): [T | undefined, (ref: any) => void] {
    const [ ref, setRef ] = useState<T>();
    const updateRef = useCallback((ref: T) => {
        if (ref !== null) {
            setRef(ref);
        }
    }, []);
    return [ref, updateRef];
}