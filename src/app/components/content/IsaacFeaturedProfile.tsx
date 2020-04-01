import React from "react";
import {IsaacFeaturedProfileDTO} from "../../../IsaacApiTypes";
import {Container} from "reactstrap";
import {apiHelper} from "../../services/api";

interface IsaacFeaturedProfileProps {
    doc: IsaacFeaturedProfileDTO;
}

export const IsaacFeaturedProfile = ({doc}: IsaacFeaturedProfileProps) => {
    const path = doc.image && doc.image.src && apiHelper.determineImageUrl(doc.image.src);
    const summary = doc.children && doc.children[0].value;

    return<div className="text-center featured-profile">
        <img className="profile-image" src={path || "/assets/nick.png"} alt="Isaac member portrait"/>
        <h6>{doc.title}</h6>
        <h6>{doc.subtitle}</h6>
        <h6>{summary}</h6>
        {doc.emailAddress && <a href={"mailto:" + doc.emailAddress}><img src='/assets/phy/icon-mailto.png' alt="Email"/></a>}
    </div>
};
