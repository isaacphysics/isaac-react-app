import React, { useLayoutEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Spacer } from "./Spacer";
import { FilterCount } from "./svg/FilterCount";
import classNames from "classnames";
import { isAda, isPhy } from "../../services";

export interface CollapsibleListProps {
    title?: string;
    asSubList?: boolean;
    expanded: boolean;
    toggle: () => void;
    numberSelected?: number;
    children?: React.ReactNode;
    className?: string;
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
            setExpandedHeight(listRef?.current ? [...listRef.current.children].map(c => 
                c.getAttribute("data-targetHeight") ? parseInt(c.getAttribute("data-targetHeight") as string) : c.clientHeight
            ).reduce((a, b) => a + b, 0) : 0);
        }
    }, [expanded, props.children]);

    const title = props.title && props.asSubList ? props.title : <b>{props.title}</b>;

    return <Col className={props.className} data-targetHeight={(headRef.current?.offsetHeight ?? 0) + (expanded ? expandedHeight : 0)}>
        <div className="row collapsible-head" ref={headRef}>
            <button className={classNames("w-100 d-flex align-items-center p-3 text-start", {"bg-white": isAda, "bg-transparent": isPhy, "ps-4": props.asSubList})} onClick={toggle}>
                {title && <span>{title}</span>}
                <Spacer/>
                {(props.numberSelected ?? 0) > 0
                    && <FilterCount count={props.numberSelected ?? 0} className="me-2" />}
                <img className={classNames("icon-dropdown-90", {"active": expanded})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
            </button>
        </div>
        <Row 
            className={`collapsible-body overflow-hidden ${expanded ? "open" : "closed"}`} 
            style={{height: expanded ? expandedHeight : 0, maxHeight: expanded ? expandedHeight : 0}}
        >
            <Col>
                <div ref={listRef} className={classNames({"ms-2": props.asSubList})}>
                    {props.children}
                </div>
            </Col>
        </Row>
    </Col>;
};
