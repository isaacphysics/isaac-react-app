import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {useLocation, useParams} from "react-router-dom";
import {goToSupersededByQuestion, selectors, useAppDispatch, useAppSelector, useGetGameboardByIdQuery, useGetQuestionQuery} from "../../state";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {
    determineAudienceViews,
    DOCUMENT_TYPE,
    fastTrackProgressEnabledBoards,
    generateQuestionTitle,
    usePreviousPageContext,
    isAda,
    isPhy,
    isStudent,
    siteSpecific,
    Subject,
    useNavigation,
    isDefined} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {DocumentSubject, GameboardContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import {FastTrackProgress} from "../elements/FastTrackProgress";
import queryString from "query-string";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedStandaloneContentWarning} from "../navigation/SupersededDeprecatedWarning";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import classNames from "classnames";
import { RevisionWarningBanner } from "../navigation/RevisionWarningBanner";
import { LLMFreeTextQuestionInfoBanner } from "../navigation/LLMFreeTextQuestionInfoBanner";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { skipToken } from "@reduxjs/toolkit/query";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";
import { PageMetadata } from "../elements/PageMetadata";
import { InaccessibleContentWarningBanner } from "../navigation/InaccessibleContentWarningBanner";
import { QuestionMetaData } from "../elements/QuestionMetadata";
import { getAccessibilityTags, useAccessibilitySettings } from "../../services/accessibility";
import { GameboardContentSidebar } from "../elements/sidebar/GameboardContentSidebar";
import { QuestionSidebar } from "../elements/sidebar/RelatedContentSidebar";
interface QuestionPageProps{
    questionIdOverride?: string;
    preview?: boolean;
}

export const Question = ({questionIdOverride, preview}: QuestionPageProps) => {
    const location = useLocation();
    const params = useParams();
    const questionId = questionIdOverride || params.questionId || "";
    const questionQuery = useGetQuestionQuery(questionId);
    const {data: doc, isLoading} = questionQuery;
    const user = useAppSelector(selectors.user.orNull);
    const allQuestionsCorrect = useAppSelector(selectors.questions.allQuestionsCorrect);
    const allQuestionsAttempted = useAppSelector(selectors.questions.allQuestionsAttempted);
    const anyQuestionAttempted = useAppSelector(selectors.questions.anyQuestionPreviouslyAttempted);
    const navigation = useNavigation(doc ?? null);
    const pageContainsLLMFreeTextQuestion = useAppSelector(selectors.questions.includesLLMFreeTextQuestion);
    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;

    const dispatch = useAppDispatch();
    const accessibilitySettings = useAccessibilitySettings();

    const pageContext = usePreviousPageContext(user && user.loggedIn && user.registeredContexts || undefined, doc && !isLoading ? doc : undefined);
    const {data: gameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

    return <ShowLoadingQuery
        query={questionQuery}
        defaultErrorTitle="Unable to load question"
        ifNotFound={<NotFound />}
        thenRender={supertypedDoc => {
            const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
            const isFastTrack = doc && doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;
            const audienceViews = determineAudienceViews(doc.audience, navigation.creationContext);

            return <GameboardContext.Provider value={navigation.currentGameboard}>
                <Container className="no-shadow" data-bs-theme={pageContext?.subject ?? doc.subjectId}>
                    <TitleAndBreadcrumb
                        currentPageTitle={generateQuestionTitle(doc)}
                        displayTitleOverride={siteSpecific("Question", undefined)}
                        subTitle={doc.subtitle}
                        intermediateCrumbs={navigation.breadcrumbHistory}
                        collectionType={navigation.collectionType}
                        audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)}
                        preview={preview} icon={{type: "icon", subject: doc.subjectId as Subject, icon: "icon-question"}}
                    />
                    {isFastTrack && fastTrackProgressEnabledBoards.includes(gameboardId || "") && <FastTrackProgress doc={doc} search={location.search} />}
                    <SidebarLayout>
                        {isDefined(gameboardId) 
                            ? <GameboardContentSidebar id={gameboardId} title={gameboard?.title || ""} questions={gameboard?.contents || []} wildCard={gameboard?.wildCard} currentContentId={questionId}/>
                            : <QuestionSidebar relatedContent={doc.relatedContent} />
                        }
                        <MainContent>
                            {!preview && <CanonicalHrefElement />}

                            <PageMetadata doc={doc} title={generateQuestionTitle(doc)}>
                                {isPhy && <QuestionMetaData 
                                    doc={doc} audienceViews={audienceViews} 
                                    allQuestionsCorrect={allQuestionsCorrect} 
                                    allQuestionsAttempted={allQuestionsAttempted} 
                                    anyQuestionAttempted={anyQuestionAttempted}
                                />}
                            </PageMetadata>
                            {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && getAccessibilityTags(doc.tags).map(tag => <InaccessibleContentWarningBanner key={tag} type={tag} />)}

                            <Row className="question-content-container">
                                <Col className={classNames("py-4 question-panel", {"px-0 px-sm-2": isPhy}, {"mw-760": isAda})}>

                                    <SupersededDeprecatedStandaloneContentWarning doc={doc} />

                                    {isAda && <IntendedAudienceWarningBanner doc={doc} />}

                                    {pageContainsLLMFreeTextQuestion && <LLMFreeTextQuestionInfoBanner doc={doc} />}

                                    <RevisionWarningBanner />

                                    <WithFigureNumbering doc={doc}>
                                        <IsaacContent doc={doc}/>
                                    </WithFigureNumbering>

                                    {doc.supersededBy && isStudent(user) && <div className="alert alert-warning">
                                        This question {" "}
                                        <Button color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                            has been replaced
                                        </Button>.<br />
                                        However, if you were assigned this version, you should complete it.
                                    </div>}

                                    {doc.attribution && <p className="text-muted">
                                        <Markup trusted-markup-encoding={"markdown"}>
                                            {doc.attribution}
                                        </Markup>
                                    </p>}

                                    <NavigationLinks navigation={navigation}/>

                                    {isAda && doc.relatedContent && !isFastTrack && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                                </Col>
                            </Row>
                        </MainContent>
                    </SidebarLayout>
                </Container>
            </GameboardContext.Provider>;}
        }
    />;
};
