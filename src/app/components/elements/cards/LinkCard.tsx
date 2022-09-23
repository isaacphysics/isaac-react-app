import React from "react";
import {Link} from "react-router-dom";

interface LinkCardProps {
    title: string;
    imageSource: string;
    linkDestination: string;
    linkText: string;
    children?: React.ReactChildren | string;
}

export const LinkCard = ({title, imageSource, linkDestination, linkText, children}: LinkCardProps) => {
    return (
        <div className="basic-card my-0 p-3 d-flex flex-column">
            <h2 className="pt-3">
                {title}
            </h2>

            <img src={imageSource} alt="" />
            <p>
                <>{children}</>
            </p>

            <Link to={linkDestination} className="footer-link mt-4 font-weight-bold lrg-text">
                {linkText}
            </Link>
        </div>
    );
};
