import classNames from "classnames";
import React from "react";
import { Row, RowProps } from "reactstrap";

export const ColumnSlice = ({...props}: RowProps) => {
    const numChildren = Math.min(React.Children.count(props.children), 4);
    return <Row {...props} className={classNames(`row-cols-md-${numChildren}`, props.className)}>
        {props.children}
    </Row>;
};
