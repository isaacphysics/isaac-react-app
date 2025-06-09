import React, { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Col, ColProps } from "reactstrap";
import { Spacer } from "./Spacer";
import { FilterCount } from "./svg/FilterCount";
import classNames from "classnames";
import { isAda, isPhy } from "../../services";

export interface CollapsibleListProps {
    title?: ReactNode;
    asSubList?: boolean;
    expanded: boolean;
    toggle: () => void;
    numberSelected?: number;
    children?: React.ReactNode;
    additionalOffset?: string | number; // css value for additional space to add to the bottom of the list when expanded; e.g. 4px, 1rem
    className?: string;
    tag?: ColProps['tag'];
}

export const CollapsibleList = (props: CollapsibleListProps) => {
    const {expanded, toggle} = props;
    const [expandedHeight, setExpandedHeight] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!listRef.current) return;
        setExpandedHeight(listRef.current.clientHeight);
    }, [listRef.current]);

    useLayoutEffect(() => {
        if (expanded) {
            setExpandedHeight(listRef?.current 
                // clientHeight cannot determine margin (nor can any reasonable alternative, since margins can overlap)! this will be smaller than the true height
                // if margin exists. if this is the case, use additionalOffset to add additional space to the bottom of the list
                ? Math.max([...listRef.current.children].map(c => c.getAttribute("data-targetheight") 
                    ? parseInt(c.getAttribute("data-targetheight") as string) 
                    : c.clientHeight
                ).reduce((a, b) => a + b, 0), listRef.current.clientHeight) 
                : 0
            );
        }
    }, [expanded, props.children]);

    const title = typeof props.title === "string" // auto styling for plain strings; prefer this where possible
        ? <span>{props.title && props.asSubList ? props.title : <b>{props.title}</b>}</span>
        : props.title;

    return <Col tag={props.tag} className={classNames("collapsible-list-container", props.className)} data-targetheight={(headRef.current?.offsetHeight ?? 0) + (expanded ? expandedHeight : 0)}>
        <div className="row m-0 collapsible-head" ref={headRef}>
            <button className={classNames("w-100 d-flex align-items-center p-3 text-start", {"bg-white": isAda, "bg-transparent": isPhy, "ps-4": props.asSubList})} onClick={toggle}>
                {title && <span>{title}</span>}
                <Spacer/>
                {(props.numberSelected ?? 0) > 0
                    && <FilterCount count={props.numberSelected ?? 0} className="me-2" />}
                <img className={classNames("icon-dropdown-90", {"active": expanded})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
            </button>
        </div>
        <div
            className={`collapsible-body ${expanded ? "open" : "closed"}`} 
            style={{height: expanded ? expandedHeight : 0, maxHeight: expanded ? expandedHeight : 0, marginBottom: expanded ? (props.additionalOffset ?? 0) : 0}}
        >
            <div ref={listRef} className={classNames({"ms-2": props.asSubList})} {...{"inert": expanded ? undefined : "true"}}> 
                {/* when react is updated to v19, switch inert definition to regular prop */}
                {props.children}
            </div>
        </div>
    </Col>;
};
