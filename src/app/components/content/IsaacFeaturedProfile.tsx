import React from "react";
import {IsaacFeaturedProfileDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";

interface IsaacFeaturedProfileProps {
    doc: IsaacFeaturedProfileDTO;
}

export const IsaacFeaturedProfile = ({doc}: IsaacFeaturedProfileProps) => {
    const path = doc.image && doc.image.src && apiHelper.determineImageUrl(doc.image.src);
    const summary = doc.children && doc.children[0].value;

    return <div className="text-center featured-profile">
        <img className="profile-image" src={path} alt=""/>
        {doc.homepage ?
            // eslint-disable-next-line react/jsx-no-target-blank
            <a href={doc.homepage} target="_blank" rel="noopener"><b>{doc.title}</b></a>
            :
            <div><b>{doc.title}</b></div>
        }
        <div className="profile-title">{doc.subtitle}</div>
        <p className="profile-description">{summary}</p>
        {doc.emailAddress &&
            <a href={"mailto:" + doc.emailAddress}>
                <img src='/assets/phy/icon-mailto.png' alt=""/>
                <span className="sr-only">{"Email " + doc.title}</span>
            </a>
        }
    </div>
};
