import classNames from "classnames";
import React from "react";

export const ImageBlock = ({...props} : React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} className={classNames("image-block", props.className)}>
        {props.children}
    </div>;
};
