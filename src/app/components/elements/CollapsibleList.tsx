import React from "react";
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
    const [expandedHeight, setExpandedHeight] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (expanded) {
            setExpandedHeight(listRef?.current ? [...listRef.current.children].map(c => c.clientHeight).reduce((a, b) => a + b, 0) : 0);
        }
    }, [expanded, props.children]);

    const title = props.title && props.asSubList ? props.title : <b>{props.title}</b>;

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
        <Row className={`collapsible-body overflow-hidden ${expanded ? "open" : "closed"}`} style={{height: expanded ? expandedHeight : 0, maxHeight: expanded ? expandedHeight : 0}}>
            <Col>
                <div ref={listRef} className={classNames("w-100", {"ms-2": props.asSubList})}>
                    {props.children}
                </div>
            </Col>
        </Row>
    </Col>;
};
