import React from "react";

interface HexagonProps {
    link: string;
    imageSrc: string;
    title: string;
    hexagonClass?: string;
}

export const Hexagon = ({link, imageSrc, title, hexagonClass}: HexagonProps ) => {
    return <a href={link} className={hexagonClass ? hexagonClass : "hexagon"}>
        <img className={hexagonClass ? hexagonClass : "hexagon"} src={imageSrc} alt="Isaac hexagon"></img>
        <div className="hexagon-title">
            {title}
        </div>
    </a>
};
