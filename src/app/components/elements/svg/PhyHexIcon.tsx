import React from "react";
import { Subject } from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface PhyHexIconProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: string;
    subject?: Subject;
}

export const PhyHexIcon = (props: PhyHexIconProps) => {
    const {icon, subject, className, ...rest} = props;
    return <div {...rest} className={classNames("d-flex pe-3", className)} {...(subject && {"data-bs-theme": subject})}>
        <div className="phy-hex-icon"/>
        <i className={classNames("icon", icon)}/>
    </div>;
};
