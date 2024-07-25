import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Spacer } from "./Spacer";
import { FilterCount } from "./svg/FilterCount";
import classNames from "classnames";
import { isDefined } from "../../services";

export interface CollapsibleListProps {
    title?: string;
    expanded?: boolean; // initial expanded state only
    subList?: boolean;
    numberSelected?: number;
    allExpanded?: boolean;
    onExpand?: (expanded: boolean) => void;
    children?: React.ReactNode;
}

export const CollapsibleList = (props: CollapsibleListProps) => {

    const firstUpdate = useRef(true);
    const [expanded, setExpanded] = useState(props.expanded || false);
    const [expandedHeight, setExpandedHeight] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (expanded) {
            setExpandedHeight(listRef?.current ? [...listRef.current.children].map(c => c.clientHeight).reduce((a, b) => a + b, 0) : 0);
        }
    }, [expanded]);

    useEffect(function callExpansionEventHook() {
        if (firstUpdate.current) {
            // Notify that this component started expanded
            if (props.onExpand && expanded) {
                props.onExpand(expanded);
            }

            firstUpdate.current = false;
            return;
        }
        if (props.onExpand) {
            props.onExpand(expanded);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded]);

    useEffect(() => {
        if (isDefined(props.allExpanded)) {
            // sub-lists should not expand on opening all lists
            setExpanded(!props.subList && props.allExpanded);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.allExpanded]);

    const title = props.title && props.subList ? props.title : <b>{props.title}</b>;
    const children = <div className="w-100" ref={listRef}>{props.children}</div>;

    return <Col>
        <Row className="collapsible-head">
            <button className={classNames("w-100 d-flex align-items-center p-3 bg-white text-start", {"ps-4": props.subList})} onClick={() => setExpanded(e => !e)}>
                {title && <span>{title}</span>}
                <Spacer/>
                {(props.numberSelected ?? 0) > 0
                    && <FilterCount count={props.numberSelected ?? 0} />}
                <img className={classNames("icon-dropdown-90", {"active": expanded})} src={"/assets/common/icons/chevron_right.svg"} alt="" />
            </button>
        </Row>
        {/* TODO: <hr className="mb-3 p-0"/> */}
        <Row className="collapsible-body overflow-hidden" style={{maxHeight: expanded ? expandedHeight : 0}}>
            {/* TODO: this feels wrong find a better way */}
            {props.subList ? <div><div className="ps-2">{children}</div></div> : children}
        </Row>
    </Col>;
};
