import React from "react";
import classNames from "classnames";
import { isPhy, Subject } from "../../../services";

interface PhyHexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: string;
    subject?: Subject;
    size?: string;
}

export const PhyHexIcon = (props: PhyHexIconProps) => {
    const {icon, subject, size, className, ...rest} = props;
    if (isPhy) {
        return <div {...rest} className={classNames("d-flex pe-3", className)} {...(subject && {"data-bs-theme": subject})}>
            <div className={classNames("phy-hex-icon", {"phy-hex-icon-sm": size === "sm"})}/>
            <i className={classNames("icon", icon)}/>
        </div>;
    }
};
