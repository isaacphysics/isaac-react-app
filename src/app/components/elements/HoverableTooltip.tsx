import React, { useRef } from "react";
import { UncontrolledTooltip } from "reactstrap";

interface HoverablePopupProps {
    tooltip: string;
}

export const HoverableTooltip = ({tooltip, children}: React.PropsWithChildren<HoverablePopupProps>) => {
    const ref = useRef<HTMLDivElement>(null);

    return <div ref={ref} className="hoverable-tooltip">
        <UncontrolledTooltip target={ref} placement="top">
            {tooltip}
        </UncontrolledTooltip>
        {children}
    </div>;
};
