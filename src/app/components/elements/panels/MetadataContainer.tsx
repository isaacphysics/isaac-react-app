import React from "react";
import classNames from "classnames";

interface MetadataContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const MetadataContainer = ({ children, ...rest }: MetadataContainerProps) => {
    return <div {...rest} className={classNames("content-metadata-container d-flex flex-column gap-2", rest.className)}>
        {children}
    </div>;
};

export const MetadataContainerLink = ({id, title}: { id: string; title: string }) => {
    return <a className="d-flex align-items-center ms-1 ps-2 invert-underline" href={`#${id}`}>
        <i className="icon icon-arrow-down me-2"/>
        {title}
    </a>;
};
