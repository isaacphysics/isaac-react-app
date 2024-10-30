import classNames from "classnames";
import React from "react";
import { Row, RowProps } from "reactstrap";

interface ColumnSliceProps extends RowProps {
    breakpoint?: "sm" | "md" | "lg" | "xl";
    reverseUnderBreakpoint?: boolean;
}

export const ColumnSlice = ({breakpoint, reverseUnderBreakpoint, children, ...rest}: ColumnSliceProps) => {
    const numChildren = Math.min(React.Children.count(children), 4);
    return <Row {...rest} className={classNames(
        `row-cols-1 row-cols-${breakpoint ?? "lg"}-${numChildren}`, 
        {[`flex-column-reverse flex-${breakpoint ?? "lg"}-row`]: reverseUnderBreakpoint},
        rest.className)
    }>
        {children}
    </Row>;
};
