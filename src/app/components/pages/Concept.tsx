import React from "react";
import {withRouter} from "react-router-dom";
import {isaacApi} from "../../state";
import {Col, Container, Row} from "reactstrap";
import {IsaacContent} from "../content/IsaacContent";
import {isCS, isPhy, siteSpecific, useNavigation} from "../../services";
import {GameboardContext} from "../../../IsaacAppTypes";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {NavigationLinks} from "../elements/NavigationLinks";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {Markup} from "../elements/markup";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";
import {ReportButton} from "../elements/ReportButton";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
    location: {search: string};
}
export const Concept = withRouter(({match: {params}, location: {search}, conceptIdOverride}: ConceptPageProps) => {
    const conceptId = conceptIdOverride || params.conceptId;
    const conceptQuery = isaacApi.endpoints.getConcept.useQuery(conceptId);
    const navigation = useNavigation(conceptQuery.data);

    return <ShowLoadingQuery
        query={conceptQuery}
        defaultErrorTitle={"Error fetching concept page"}
        thenRender={doc => <div className={doc.subjectId || ""}>
            <GameboardContext.Provider value={navigation.currentGameboard}>
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
                        <div className="question-actions">
                            <ReportButton pageId={conceptId}/>
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
            </GameboardContext.Provider>
        </div>}
    />;
});
