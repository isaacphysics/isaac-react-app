import classNames from "classnames";
import React from "react";
import { Row, RowProps } from "reactstrap";

interface ColumnSliceProps extends RowProps {
    breakpoint?: "sm" | "md" | "lg" | "xl";
}

export const ColumnSlice = ({...props}: ColumnSliceProps) => {
    const numChildren = Math.min(React.Children.count(props.children), 4);
    return <Row {...props} className={classNames(`row-cols-1 row-cols-${props.breakpoint ?? "lg"}-${numChildren}`, props.className)}>
        {props.children}
    </Row>;
};
