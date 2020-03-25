import React from "react";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
}

export const Hexagon = ({link, imageSrc, title}: HexagonProps ) => {
    return <a href={link} className="hexagon">
        <img className="hexagon-field" src={imageSrc} alt="Isaac hexagon"></img>
        <div className="hexagon-title">
            {title}
        </div>
    </a>
};
