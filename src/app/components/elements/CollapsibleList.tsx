import React, { useLayoutEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Spacer } from "./Spacer";
import { FilterCount } from "./svg/FilterCount";
import classNames from "classnames";

export interface CollapsibleListProps {
    title?: string;
    asSubList?: boolean;
    expanded: boolean;
    toggle: () => void;
    numberSelected?: number;
    children?: React.ReactNode;
    
}

export const CollapsibleList = (props: CollapsibleListProps) => {
    const {expanded, toggle} = props;

    const title = props.title && props.asSubList ? props.title : <b>{props.title}</b>;
    const children = <div className="w-100">{props.children}</div>;

    return <Col>
        <Row className="collapsible-head">
            <button className={classNames("w-100 d-flex align-items-center p-3 bg-white text-start", {"ps-4": props.asSubList})} onClick={toggle}>
                {title && <span>{title}</span>}
                <Spacer/>
                {(props.numberSelected ?? 0) > 0
                    && <FilterCount count={props.numberSelected ?? 0} />}
                <img className={classNames("icon-dropdown-90", {"active": expanded})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
            </button>
        </Row>
        {/* TODO: <hr className="mb-3 p-0"/> */}
        <Row className={`collapsible-body overflow-hidden ${expanded ? "open" : "closed"}`}>
            {/* TODO: this feels wrong find a better way */}
            {props.asSubList ? <div><div className="ps-2">{children}</div></div> : children}
        </Row>
    </Col>;
};
