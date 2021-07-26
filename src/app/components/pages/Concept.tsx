import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {NavigationLinks} from "../elements/NavigationLinks";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
}
export const Concept = withRouter(({match: {params}, conceptIdOverride}: ConceptPageProps) => {
    const dispatch = useDispatch();
    const conceptId = conceptIdOverride || params.conceptId;
    useEffect(() => {dispatch(fetchDoc(DOCUMENT_TYPE.CONCEPT, conceptId));}, [conceptId]);
    const doc = useSelector((state: AppState) => state?.doc || null);
    const navigation = useNavigation(doc);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <div className={doc.subjectId || ""}>
            <Container>
                <TitleAndBreadcrumb
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    currentPageTitle={doc.title as string}
                    collectionType={navigation.collectionType}
                />
                <div className="no-print d-flex align-items-center">
                    <div className="not-mobile">
                        <EditContentButton doc={doc} />
                    </div>
                    <div className="mt-3 mr-sm-1 ml-auto">
                        <UserContextPicker className="no-print text-right" />
                    </div>
                    <div className="question-actions">
                        <ShareLink linkUrl={`/concepts/${conceptId}`} />
                    </div>
                    <div className="question-actions not-mobile">
                        <PrintButton />
                    </div>
                </div>

                <Row className="concept-content-container">
                    <Col md={{[SITE.CS]: {size: 8, offset: 2}, [SITE.PHY]: {size: 12}}[SITE_SUBJECT]} className="py-4">
                        <IntendedAudienceWarningBanner doc={doc} />

                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>

                        {doc.attribution && <p className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></p>}

                        <NavigationLinks navigation={navigation} />

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>
    }}/>;
});
