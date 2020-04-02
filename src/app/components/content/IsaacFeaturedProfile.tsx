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
        <img className="profile-image" src={path || "/assets/nick.png"} alt=""/>
        <h6 className="profile-title">{doc.title}</h6>
        <h6>{doc.subtitle}</h6>
        <p className="profile-description">{summary}</p>
        {doc.emailAddress && <a href={"mailto:" + doc.emailAddress}><img src='/assets/phy/icon-mailto.png' alt="Email"/></a>}
    </div>
};
