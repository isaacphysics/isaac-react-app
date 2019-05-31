import React from "react";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";
import {DOCUMENT_TYPE, documentTypePathPrefix} from "../../services/constants";

interface RelatedContentProps {
    content: ContentSummaryDTO[];
}
export const RelatedContent = ({content}: RelatedContentProps) => {
    return <div className="simple-card my-3 my-md-5 p-3 p-md-5 text-wrap">
        <h2 className="mb-4">Related Content</h2>
        <div className="d-lg-flex">
            <ListGroup className="w-100 mb-lg-3 mr-lg-3 w-lg-50">
                {content.map((contentSummary) => (
                    <ListGroupItem key={contentSummary} className="w-100 mb-lg-3 mr-lg-3 w-lg-50">
                        <Link
                            to={`/${documentTypePathPrefix[contentSummary.type as DOCUMENT_TYPE]}/${contentSummary.id}`}
                            className="lrg-text font-weight-bold"
                        >
                            {contentSummary.title}
                        </Link>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    </div>
};
