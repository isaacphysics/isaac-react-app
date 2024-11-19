import classNames from "classnames";
import React, { useLayoutEffect, useRef, useState } from "react";

export interface CollapsibleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    expanded: boolean;
}

export const CollapsibleContainer = (props: CollapsibleContainerProps) => {
    const {expanded, ...rest} = props;
    const [expandedHeight, setExpandedHeight] = useState(0);

    const divRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (expanded) {
            setExpandedHeight(divRef?.current ? [...divRef.current.children].map(c => 
                c.getAttribute("data-targetHeight") ? parseInt(c.getAttribute("data-targetHeight") as string) : c.clientHeight
            ).reduce((a, b) => a + b, 0) : 0);
        }
    }, [expanded, props.children]);

    return <div {...rest} 
        className={classNames("collapsible-body", rest.className)} 
        style={{height: expanded ? expandedHeight : 0, maxHeight: expanded ? expandedHeight : 0, ...rest.style}}
        data-targetHeight={expandedHeight}
        ref={divRef} 
    />;
};
