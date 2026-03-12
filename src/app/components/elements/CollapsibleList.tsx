import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Col } from "reactstrap";
import { Spacer } from "./Spacer";
import { FilterCount } from "./svg/FilterCount";
import classNames from "classnames";
import { isAda, isPhy, siteSpecific } from "../../services";

export const CollapsibleContext = React.createContext<{expanded: boolean, recalculateHeight: () => void} | undefined>(undefined);

export interface CollapsibleListProps {
    title?: ReactNode;
    asSubList?: boolean;
    expanded: boolean;
    toggle: () => void;
    numberSelected?: number;
    children?: React.ReactNode;
    additionalOffset?: string | number; // css value for additional space to add to the bottom of the list when expanded; e.g. 4px, 1rem
    className?: string;
    tag?: React.ElementType;
}

export const CollapsibleList = (props: CollapsibleListProps) => {
    const {expanded, toggle, tag: Tag = Col} = props;
    const [expandedContainerHeight, setExpandedContainerHeight] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLElement>(null);

    const parentCollapsible = React.useContext(CollapsibleContext);

    const recalculateHeight = useCallback(() => {
        let containerHeight : number | undefined = 0;

        if (expanded) {
            containerHeight = listRef?.current 
                // clientHeight cannot determine margin (nor can any reasonable alternative, since margins can overlap)! this will be smaller than the true height
                // if margin exists. if this is the case, use additionalOffset to add additional space to the bottom of the list
                ? [...listRef.current.children].map(c => c.getAttribute("data-targetheight")
                    ? parseInt(c.getAttribute("data-targetheight") as string) 
                    : c.clientHeight
                ).reduce((a, b) => a + b, 0)
                : undefined;
            
            if (containerHeight !== 0) {
                // if children are present in the DOM but have zero clientHeight (e.g. display: none from being on an inactive tab), 
                // without this condition we would set the target expansion height to 0 if the children update through some external means. 
                // this would hide the children when their correct height / visibility is restored.
                setExpandedContainerHeight(containerHeight ?? 0);
            }
        }
        
        // update targetHeight for use in any recursive call to the parent. we could not do this as a stateful prop on the component as it would be one render out of date 
        if (containerRef.current) {
            containerRef.current.setAttribute(
                "data-targetheight",
                // container border size + header size + list size
                ((containerRef.current.offsetHeight - containerRef.current.clientHeight) + (headRef.current?.offsetHeight ?? 0) + (containerHeight ?? 0)).toString()
            );
        }

        if (parentCollapsible?.expanded) {
            // recursively update the height of any parent collapsible lists. separate from the below useEffect as changes to data-targetHeight do not trigger that.
            parentCollapsible?.recalculateHeight();
        }
    }, [expanded, parentCollapsible]);

    useEffect(() => {
        // update the height when children's height changes in some way (expansion, collapse, child state change, etc)
        const resizeObserver = new ResizeObserver(() => recalculateHeight());
        resizeObserver.observe(listRef.current as Element);
        return () => resizeObserver.disconnect();
    }, [recalculateHeight]);

    const title = typeof props.title === "string" // auto styling for plain strings; prefer this where possible
        ? <span>{props.title && props.asSubList ? props.title : <b>{props.title}</b>}</span>
        : props.title;

    return <Tag ref={containerRef} className={classNames("collapsible-list-container", props.className)}>
        <div className="row m-0 collapsible-head" ref={headRef}>
            <button 
                className={classNames("w-100 d-flex align-items-center p-3 text-start", {"bg-white": isAda, "bg-transparent": isPhy, "ps-4": props.asSubList})} 
                onClick={toggle}
            >
                {title && <span>{title}</span>}
                <Spacer/>
                {(props.numberSelected ?? 0) > 0
                    && <FilterCount count={props.numberSelected ?? 0} className="me-2" widthPx={siteSpecific(25, 24)} />}
                <i className={classNames("icon icon-chevron-right icon-dropdown-90", {"active": expanded})} aria-hidden="true" />
            </button>
        </div>
        <div
            className={classNames("collapsible-body", expanded ? "open" : "closed", {"ms-2": props.asSubList})} 
            style={{height: expanded ? expandedContainerHeight : 0, maxHeight: expanded ? expandedContainerHeight : 0, marginBottom: expanded ? (props.additionalOffset ?? 0) : 0}}
            // when react is updated to v19, switch inert definition to regular prop
            {...{"inert": expanded ? undefined : "true"}} 
        >
            <CollapsibleContext.Provider value={{expanded, recalculateHeight}}>
                <ul className="list-unstyled" ref={listRef}>{props.children}</ul>
            </CollapsibleContext.Provider>
        </div>
    </Tag>;
};
