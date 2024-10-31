import classNames from "classnames";
import React from "react";
import { Col, ColProps } from "reactstrap";

export const ImageBlock = ({...props} : ColProps) => {
    return <Col {...props} className={classNames("d-flex align-items-center", props.className)}>
        <div className={"position-relative w-100 image-block"}>
            {props.children}
        </div>
    </Col>;
};
