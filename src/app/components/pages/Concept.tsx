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
import {Markup} from "../elements/markup";
import {isCS, isPhy, siteSpecific} from "../../services/siteConstants";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
    location: {search: string};
}
export const Concept = withRouter(({match: {params}, location: {search}, conceptIdOverride}: ConceptPageProps) => {
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
                    subTitle={doc.subtitle as string}
                />
                <MetaDescription description={doc.summary} />
                <CanonicalHrefElement />
                <div className="no-print d-flex align-items-center">
                    <EditContentButton doc={doc} />
                    <div className="mt-3 mr-sm-1 ml-auto">
                        <UserContextPicker className="no-print text-right" />
                    </div>
                    <div className="question-actions">
                        <ShareLink linkUrl={`/concepts/${conceptId}${search || ""}`} />
                    </div>
                    <div className="question-actions not-mobile">
                        <PrintButton />
                    </div>
                </div>

                <Row className="concept-content-container">
                    <Col md={siteSpecific({size: 12}, {size: 8, offset: 2})} className="py-4">

                        <SupersededDeprecatedWarningBanner doc={doc} />

                        <IntendedAudienceWarningBanner doc={doc} />

                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>

                        {doc.attribution && <p className="text-muted">
                            <Markup trusted-markup-encoding={"markdown"}>
                                {doc.attribution}
                            </Markup>
                        </p>}

                        {isCS && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}

                        <NavigationLinks navigation={navigation} />

                        {isPhy && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>
    }}/>;
});
