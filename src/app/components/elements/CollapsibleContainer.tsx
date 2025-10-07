import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CollapsibleContext } from "./CollapsibleList";

export interface CollapsibleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    expanded: boolean;
}

export const CollapsibleContainer = (props: CollapsibleContainerProps) => {
    const {expanded, children, ...rest} = props;
    const [expandedContainerHeight, setExpandedContainerHeight] = useState(0);

    const parentCollapsible = React.useContext(CollapsibleContext);

    const divRef = useRef<HTMLDivElement>(null);
    
    // see CollapsibleList for explanation of this logic; this version is simplified as there is no header to account for
    const recalculateHeight = useCallback(() => {
        let containerHeight : number | undefined = 0;

        if (expanded) {
            containerHeight = divRef?.current 
                ? [...divRef.current.children].map(c => c.getAttribute("data-targetheight")
                    ? parseInt(c.getAttribute("data-targetheight") as string) 
                    : c.clientHeight
                ).reduce((a, b) => a + b, 0)
                : undefined;
            
            if (containerHeight !== 0) {
                setExpandedContainerHeight(containerHeight ?? 0);
            }
        }
        
        if (divRef.current) {
            divRef.current.setAttribute(
                "data-targetheight",
                (containerHeight ?? 0).toString()
            );
        }

        if (parentCollapsible?.expanded) {
            parentCollapsible?.recalculateHeight();
        }
    }, [expanded, parentCollapsible]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => recalculateHeight());
        resizeObserver.observe(divRef.current as Element);
        return () => resizeObserver.disconnect();
    }, [recalculateHeight]);

    return <div {...rest} 
        className={classNames("collapsible-body", rest.className)} 
        style={{height: expanded ? expandedContainerHeight : 0, maxHeight: expanded ? expandedContainerHeight : 0, ...rest.style}}
        ref={divRef}
    >
        <CollapsibleContext.Provider value={{expanded, recalculateHeight}}>
            {children}
        </CollapsibleContext.Provider>
    </div>;
};
