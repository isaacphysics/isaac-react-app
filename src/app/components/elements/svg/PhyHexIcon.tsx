import React from "react";
import { Subject } from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface PhyHexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: string;
    subject?: Subject;
    size?: string;
}

export const PhyHexIcon = (props: PhyHexIconProps) => {
    const {icon, subject, size, className, ...rest} = props;
    return <div {...rest} className={classNames("d-flex pe-3", className)} {...(subject && {"data-bs-theme": subject})}>
        <div className={classNames("phy-hex-icon", {"phy-hex-icon-sm": size === "sm"})}/>
        <i className={classNames("icon", icon)}/>
    </div>;
};
