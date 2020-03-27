import React from "react";
import classNames from "classnames";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
    disabled?: boolean;
}

export const Hexagon = ({link, imageSrc, title, disabled}: HexagonProps ) => {
    let classes = classNames({"hexagon": true, "disabled": disabled});
    return <a href={link} className={classes} aria-disabled={disabled} >
        <img className={classes} src={imageSrc} alt="" />
        <div className="hexagon-title">
            {title}
        </div>
    </a>
};
