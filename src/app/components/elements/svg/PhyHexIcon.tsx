import React from "react";
import classNames from "classnames";
import { isPhy, Subject } from "../../../services";

export interface PhyHexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: string;
    subject?: Subject;
    size?: "lg" | "xl";
}

export const PhyHexIcon = (props: PhyHexIconProps) => {
    const {icon, subject, size, className, ...rest} = props;
    if (isPhy) {
        return <div {...rest} className={classNames("d-flex pe-3", className)} {...(subject && {"data-bs-theme": subject})}>
            <div className={classNames("phy-hex-icon", size === "lg" ? "icon-lg" : "icon-xl")}/>
            <i className={classNames("icon", icon, size === "lg" ? "icon-lg" : "icon-xl")}/>
        </div>;
    }
};
