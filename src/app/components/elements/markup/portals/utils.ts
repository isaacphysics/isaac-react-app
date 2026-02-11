import {useCallback, useEffect, useRef, useState} from "react";
import {useGlossaryTermsInHtml} from "./GlossaryTerms";
import {useAccessibleTablesInHtml} from "./Tables";
import {useClozeDropRegionsInHtml} from "./renderClozeDropRegions";
import { useInlineEntryZoneInHtml } from "./renderInlineEntryZone";
import { isEqual } from "lodash";

export type PortalInHtmlHook = () => [(html: string, parentId?: string) => string, (ref?: HTMLElement) => JSX.Element[]];

// These are the hooks that the Table component is allowed to use
export const TABLE_COMPATIBLE_PORTAL_HOOKS: PortalInHtmlHook[] = [
    useClozeDropRegionsInHtml,
    useInlineEntryZoneInHtml,
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
    useInlineEntryZoneInHtml,
    useGlossaryTermsInHtml
];

// This looks nasty since it calls other hooks in a loop, but as long as the same hooks are called in the same order each
// time, React is perfectly happy with it.
// For this to be guaranteed, **the parameter `hookList` MUST STAY CONSTANT** (i.e. either use one of the `portalHooks` constants
// above or define an array inline, but make sure that you don't modify the array at any point). Most use cases should only
// need the predefined hooks below this.
const portalsInHtmlHookBuilder = (hookList?: PortalInHtmlHook[]): PortalInHtmlHook => (): [(html: string, parentId?: string) => string, (ref?: HTMLElement) => JSX.Element[]] => {
    const htmlFuncs = useRef<((html: string, parentId?: string) => string)[]>([]);
    const [portalFuncs, setPortalFuncs] = useState<((ref?: HTMLElement) => JSX.Element[])[]>([]);

    /**
     * @see htmlFuncs   is a set of functions that take in the raw editor HTML (e.g. markdown tables) and replace these areas with a blank div with a known id.
     * @see portalFuncs is a set of functions that take in a ref of a parent to these blank divs, and returns a set of portal elements targeting the blank divs,
     *                  replacing them with other content (e.g. React tables with shadows, expansion, etc).
     * 
     * htmlFuncs, once calculated once, will never change, since these are a static group of functions that modify a given HTML string. we can't
     * do the usual e.g. put it inside a useEffect with empty deps, however, because it is the result of a hook (react/no-nested-hooks). instead, we
     * populate it in the loop below, accept that this will run multiple times, but ensure that React ignores this by making them in a ref, 
     * preventing re-renders.
     *  
     * portalFuncs, on the other hand, will change based on the last call to htmlFuncs. we need changes to this to trigger a recalculation of portalFunc,
     * so that React renders portals with the correct target ids. as such, this is stored in state. a useEffect below updates portalFunc when this changes.
     */

    htmlFuncs.current = [];
    const newPortalFuncs = [] as ((ref?: HTMLElement) => JSX.Element[])[];
    hookList?.forEach(hook => {
        const [htmlFunc, portalFunc] = hook();
        htmlFuncs.current.push(htmlFunc);
        newPortalFuncs.push(portalFunc);
    });

    if (!isEqual(newPortalFuncs, portalFuncs)) { // ignore reference inequality (guaranteed by construction – infinite re-render without) so long as the contents are the same
        setPortalFuncs(newPortalFuncs);
    }

    const htmlFunc = useCallback((html: string, parentId?: string): string => {
        const htmlFuncResult = htmlFuncs.current.reduce((modifiedHtml, func) => func(modifiedHtml, parentId), html);
        return htmlFuncResult;
    }, []);

    const [portalFunc, setPortalFunc] = useState<(ref?: HTMLElement) => JSX.Element[]>(() => () => []);
    useEffect(() => {
        setPortalFunc(() => (ref?: HTMLElement) => portalFuncs.flatMap(func => func(ref)));
    }, [portalFuncs]);

    return [
        htmlFunc,
        portalFunc
    ];
};
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
