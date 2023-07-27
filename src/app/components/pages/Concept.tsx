import React from "react";
import {withRouter} from "react-router-dom";
import {useGetConceptPageQuery} from "../../state";
import {Col, Container, Row} from "reactstrap";
import {IsaacContent} from "../content/IsaacContent";
import {DOCUMENT_TYPE, isAda, isPhy, useNavigation} from "../../services";
import {GameboardContext, PageContext} from "../../../IsaacAppTypes";
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
import classNames from "classnames";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {NotFound} from "./NotFound";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
    location: {search: string};
    preview?: boolean;
}
export const Concept = withRouter(({match: {params}, location: {search}, conceptIdOverride, preview}: ConceptPageProps) => {
    const conceptId = conceptIdOverride || params.conceptId;
    const docQuery = useGetConceptPageQuery(conceptId);
    const navigation = useNavigation(docQuery.data);
    return <ShowLoadingQuery
        query={docQuery}
        ifNotFound={<NotFound/>}
        ifError={NotFound}
        thenRender={doc => {
            return <GameboardContext.Provider value={navigation.currentGameboard}>
                <PageContext.Provider value={{id: doc.id, type: doc.type as DOCUMENT_TYPE, level: doc.level}}>
                    <Container className={classNames(doc.subjectId)}>
                        <TitleAndBreadcrumb
                            intermediateCrumbs={navigation.breadcrumbHistory}
                            currentPageTitle={doc.title as string}
                            collectionType={navigation.collectionType}
                            subTitle={doc.subtitle as string}
                            preview={preview}
                        />
                        {!preview && <>
                            <MetaDescription description={doc.summary} />
                            <CanonicalHrefElement />
                        </>}
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
                            <Col className={classNames("py-4", {"mw-760": isAda})}>

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

                                {isAda && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}

                                <NavigationLinks navigation={navigation} />

                                {isPhy && doc.relatedContent && <RelatedContent conceptId={conceptId} content={doc.relatedContent} parentPage={doc} />}
                            </Col>
                        </Row>
                    </Container>
                </PageContext.Provider>
            </GameboardContext.Provider>
        }}
    />;
});
