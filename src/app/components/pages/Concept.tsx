import React, { useEffect } from "react";
import {withRouter} from "react-router-dom";
import {selectors, useAppSelector} from "../../state";
import {Col, Container, Row} from "reactstrap";
import {IsaacContent} from "../content/IsaacContent";
import {IsaacConceptPageDTO} from "../../../IsaacApiTypes";
import {Subject, above, below, usePreviousPageContext, isAda, isPhy, useDeviceSize, useNavigation, siteSpecific, useUserViewingContext, isFullyDefinedContext, isSingleStageContext, LEARNING_STAGE_TO_STAGES} from "../../services";
import {DocumentSubject, GameboardContext} from "../../../IsaacAppTypes";
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
import { ConceptSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { TeacherNotes } from "../elements/TeacherNotes";
import { useGetConceptQuery } from "../../state/slices/api/conceptsApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";

interface ConceptPageProps {
    conceptIdOverride?: string;
    match: {params: {conceptId: string}};
    location: {search: string};
    preview?: boolean;
}

export const Concept = withRouter(({match: {params}, location: {search}, conceptIdOverride, preview}: ConceptPageProps) => {
    const conceptId = conceptIdOverride || params.conceptId;
    const user = useAppSelector(selectors.user.orNull);
    const conceptQuery = useGetConceptQuery(conceptId);
    const {data: doc, isLoading} = conceptQuery;
    const navigation = useNavigation(doc ?? null);
    const deviceSize = useDeviceSize();
    
    const userContext = useUserViewingContext();
    const pageContext = usePreviousPageContext(user && user.loggedIn && user.registeredContexts || undefined, doc && !isLoading ? doc : undefined);

    useEffect(() => {
        if (pageContext) {
            // the page context, if single stage, overrides the user context
            if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
                const newStage = LEARNING_STAGE_TO_STAGES[pageContext.stage[0]];
                if (newStage) {
                    userContext.setStage(newStage[0]);
                    userContext.setFixedContext(true);
                }
            }
            // all other cases use the default behaviour
        }
    }, [pageContext]);

    const ManageButtons = () => <div className={classNames("no-print d-flex justify-content-end mt-1 ms-2", {"gap-2": isPhy})}>
        <div className="question-actions">
            <ShareLink linkUrl={`/concepts/${conceptId}${search || ""}`} />
        </div>
        <div className={classNames("question-actions", {"not-mobile": isAda})}>
            <PrintButton />
        </div>
        <div className="question-actions">
            <ReportButton pageId={conceptId}/>
        </div>
    </div>;

    return <ShowLoadingQuery
        query={conceptQuery}
        defaultErrorTitle="Unable to load concept"
        ifNotFound={<NotFound />}
        thenRender={supertypedDoc => {
            const doc = supertypedDoc as IsaacConceptPageDTO & DocumentSubject;
            return <GameboardContext.Provider value={navigation.currentGameboard}>
                <Container data-bs-theme={doc.subjectId ?? pageContext?.subject}>
                    <TitleAndBreadcrumb
                        intermediateCrumbs={navigation.breadcrumbHistory}
                        currentPageTitle={doc.title as string}
                        displayTitleOverride={siteSpecific("Concept", undefined)}
                        collectionType={navigation.collectionType}
                        subTitle={siteSpecific(undefined, doc.subtitle as string)}
                        preview={preview}
                        icon={{type: "hex", subject: doc.subjectId as Subject, icon: "icon-concept"}}
                    />
                    {!preview && <>
                        <MetaDescription description={doc.summary} />
                        <CanonicalHrefElement />
                    </>}
                    <SidebarLayout>
                        <ConceptSidebar relatedContent={doc.relatedContent} />
                        <MainContent>
                            {isPhy && <>
                                <div className="no-print d-flex align-items-center my-3">
                                    <div>
                                        <h2 className="text-theme-dark"><Markup encoding="latex">{doc.title as string}</Markup></h2>
                                        {doc.subtitle && <h5 className="text-theme-dark">{doc.subtitle}</h5>}
                                    </div>
                                    <div className="d-flex gap-2 ms-auto">
                                        <ShareLink linkUrl={`/concepts/${conceptId}${search || ""}`} />
                                        <PrintButton />
                                        <ReportButton pageId={conceptId}/>
                                    </div>
                                </div>

                                <div className="section-divider"/>

                                <div className="d-flex justify-content-end align-items-center me-sm-1 flex-grow-1">
                                    <EditContentButton doc={doc} />
                                    <UserContextPicker />
                                </div>
                            </>}

                            {isAda && <>
                                {below["sm"](deviceSize) && <ManageButtons />}

                                <div className="d-flex justify-content-end align-items-center me-sm-1 flex-grow-1">
                                    <EditContentButton doc={doc} />
                                    <UserContextPicker />
                                    {above["md"](deviceSize) && <ManageButtons />}
                                </div>
                            </>}

                            <TeacherNotes notes={doc.teacherNotes} />

                            <Row className="concept-content-container">
                                <Col className={classNames("py-4 concept-panel", {"mw-760": isAda})}>

                                    <SupersededDeprecatedWarningBanner doc={doc} />

                                    {isAda && <IntendedAudienceWarningBanner doc={doc} />}

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
                                </Col>
                            </Row>
                        </MainContent>
                    </SidebarLayout>
                </Container>
            </GameboardContext.Provider>;
        }}
    />; 
});
