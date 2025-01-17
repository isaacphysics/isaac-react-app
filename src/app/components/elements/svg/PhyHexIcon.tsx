import React from "react";
import { Subject } from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface PhyHexIconProps {
    icon: string;
    subject?: Subject;
}

export const PhyHexIcon = (props: PhyHexIconProps) => {
    const {icon} = props;
    return <div className="d-flex pe-3" {...(props?.subject && {"data-bs-theme": props.subject})}>
        <div className="phy-hex-icon"/>
        <i className={classNames("icon", icon)}/>
    </div>;
};
