import React, { useEffect } from "react";
import {useLocation, useParams} from "react-router-dom";
import {selectors, useAppSelector, useGetGameboardByIdQuery} from "../../state";
import {Col, Container, Row} from "reactstrap";
import {IsaacContent} from "../content/IsaacContent";
import {IsaacConceptPageDTO} from "../../../IsaacApiTypes";
import {Subject, usePreviousPageContext, isAda, useNavigation, siteSpecific, useUserViewingContext, isFullyDefinedContext, isSingleStageContext, LEARNING_STAGE_TO_STAGES, isDefined, isPhy} from "../../services";
import {DocumentSubject, GameboardContext} from "../../../IsaacAppTypes";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {NavigationLinks} from "../elements/NavigationLinks";
import {Markup} from "../elements/markup";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedStandaloneContentWarning} from "../navigation/SupersededDeprecatedWarning";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import queryString from "query-string";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { useGetConceptQuery } from "../../state/slices/api/conceptsApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";
import { PageMetadata } from "../elements/PageMetadata";
import { getAccessibilityTags, useAccessibilitySettings } from "../../services/accessibility";
import { InaccessibleContentWarningBanner } from "../navigation/InaccessibleContentWarningBanner";
import { skipToken } from "@reduxjs/toolkit/query";
import { GameboardContentSidebar } from "../elements/sidebar/GameboardContentSidebar";
import { ConceptSidebar } from "../elements/sidebar/RelatedContentSidebar";

interface ConceptPageProps {
    conceptIdOverride?: string;
    preview?: boolean;
}

export const Concept = ({conceptIdOverride, preview}: ConceptPageProps) => {
    const params = useParams();
    const location = useLocation();
    const conceptId = conceptIdOverride || params.conceptId || "";
    const user = useAppSelector(selectors.user.orNull);
    const conceptQuery = useGetConceptQuery(conceptId);
    const {data: doc, isLoading} = conceptQuery;
    const navigation = useNavigation(doc ?? null);
    
    const userContext = useUserViewingContext();
    const pageContext = usePreviousPageContext(user && user.loggedIn && user.registeredContexts || undefined, doc && !isLoading ? doc : undefined);
    const accessibilitySettings = useAccessibilitySettings();

    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;
    const {data: gameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

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
                        subTitle={doc.subtitle}
                        preview={preview}
                        icon={{type: "icon", subject: doc.subjectId as Subject, icon: "icon-concept"}}
                    />
                    {!preview && <>
                        <MetaDescription description={doc.summary} />
                        <CanonicalHrefElement />
                    </>}
                    <SidebarLayout site={isPhy}>
                        {isDefined(gameboardId) 
                            ? <GameboardContentSidebar id={gameboardId} title={gameboard?.title || ""} questions={gameboard?.contents || []} wildCard={gameboard?.wildCard} currentContentId={doc.id}/>
                            : <ConceptSidebar relatedContent={doc.relatedContent}/>
                        }
                        <MainContent>
                            <PageMetadata doc={doc} />

                            {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && getAccessibilityTags(doc.tags).map(tag => <InaccessibleContentWarningBanner key={tag} type={tag} />)}

                            <Row className="concept-content-container">
                                <Col className={classNames("py-4 concept-panel", {"mw-760": isAda})}>

                                    <SupersededDeprecatedStandaloneContentWarning doc={doc} />

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
};
