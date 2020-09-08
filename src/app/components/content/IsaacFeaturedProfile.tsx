import React from "react";
import {IsaacFeaturedProfileDTO} from "../../../IsaacApiTypes";
import {apiHelper} from "../../services/api";
import {IsaacContent} from "./IsaacContent";
import {Col, Row} from "reactstrap";

interface IsaacFeaturedProfileProps {
    doc: IsaacFeaturedProfileDTO;
}

export const IsaacFeaturedProfile = ({doc}: IsaacFeaturedProfileProps) => {
    const path = doc.image && doc.image.src && apiHelper.determineImageUrl(doc.image.src);
    const summary = doc.children && doc.children[0];

    return <div className="text-center featured-profile">
        <div>
            <img className="profile-image" src={path} alt=""/>
        </div>
        <Row className="profile-titles">
            <Col>
                <div className="profile-title">
                    {doc.homepage ?
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <a href={doc.homepage} target="_blank" rel="noopener"><b>{doc.title}</b></a>
                        :
                        <div><b>{doc.title}</b></div>
                    }
                </div>
                {doc.subtitle && <div className="profile-subtitle">{doc.subtitle}</div>}
            </Col>
        </Row>
        <div className="profile-description">
            <IsaacContent doc={summary} />
        </div>
        {doc.emailAddress &&
            <a href={"mailto:" + doc.emailAddress}>
                <img src='/assets/phy/icon-mailto.png' alt=""/>
                <span className="sr-only">{"Email " + doc.title}</span>
            </a>
        }
    </div>
};
