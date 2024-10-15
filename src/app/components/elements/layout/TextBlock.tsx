import classNames from "classnames";
import React from "react";
import { Col, ColProps } from "reactstrap";

export const TextBlock = ({...props} : ColProps) => {
    return <Col {...props} className={classNames("p-4 px-5 d-flex align-items-center", props.className)}>
        <div className="position-relative">
            {props.children}
        </div>
    </Col>;
};
