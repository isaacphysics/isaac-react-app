import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Spacer } from "./Spacer";
import classNames from "classnames";

export interface CollapsibleListProps {
    title?: string;
    expanded?: boolean; // initial expanded state only
    children?: React.ReactNode;
}

export const CollapsibleList = (props: CollapsibleListProps) => {

    const [expanded, setExpanded] = useState(props.expanded || false);
    const [expandedHeight, setExpandedHeight] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (expanded) {
            setExpandedHeight(listRef?.current ? [...listRef.current.children].map(c => c.clientHeight).reduce((a, b) => a + b, 0) : 0);
        }
    }, [expanded]);

    return <Col>
        <Row className="collapsible-head">
            <button className="w-100 d-flex align-items-center p-3 bg-white" onClick={() => setExpanded(e => !e)}>
                {props.title && <span><b>{props.title}</b></span>}
                <Spacer/>
                <img className={classNames("icon-dropdown-90", {"active": expanded})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
            </button>
        </Row>
        {/* TODO: <hr className="mb-3 p-0"/> */}
        <Row className="collapsible-body overflow-hidden" style={{maxHeight: expanded ? expandedHeight : 0}}>
            <div className="w-100" ref={listRef}>
                {props.children}
            </div>
        </Row>
    </Col>;
};