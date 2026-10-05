import React from "react";
import {IsaacFeaturedProfileDTO} from "../../../IsaacApiTypes";
import {apiHelper, isDefined} from "../../services";
import {IsaacContent} from "./IsaacContent";
import {Col, Row} from "reactstrap";
import { Spacer } from "../elements/Spacer";
import { useTranslation } from "react-i18next";

interface IsaacFeaturedProfileProps {
    doc: IsaacFeaturedProfileDTO;
    contentIndex?: number;
}

export const IsaacFeaturedProfile = ({doc, contentIndex}: IsaacFeaturedProfileProps) => {
    const { t } = useTranslation();
    const path = doc.image && doc.image.src && apiHelper.determineImageUrl(doc.image.src);
    const summary = doc.children && doc.children[0];

    return <div className={`text-center featured-profile d-flex flex-column ${contentIndex && contentIndex % 3 === 0 ? "featured-profile-new-row" : ""}`}>
        <div>
            <img className="profile-image" src={path} alt=""/>
        </div>
        <Row className="profile-titles">
            <Col>
                <div className="profile-title">
                    {doc.homepage ?
                        <a href={doc.homepage} target="_blank" rel="noopener"><b>{doc.title}</b></a>
                        :
                        <div><b>{doc.title}</b></div>
                    }
                </div>
                {doc.subtitle && <div className="profile-subtitle">{doc.subtitle}</div>}
            </Col>
        </Row>
        <div className="profile-description">
            {isDefined(summary) && <IsaacContent doc={summary} />}
        </div>
        <Spacer/>
        {doc.emailAddress && <a href={"mailto:" + doc.emailAddress} className="mb-4">
            <img src='/assets/phy/icons/icon-mailto.png' alt=""/>
            <span className="visually-hidden">{t("common:profiles.featured.emailLinkLabel", { name: doc.title })}</span>
        </a>}
    </div>;
};
