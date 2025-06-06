import React from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {match, RouteComponentProps, withRouter} from "react-router-dom";
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
    TAG_ID,
    tags,
    useNavigation,
    isDefined
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {DocumentSubject, GameboardContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import {FastTrackProgress} from "../elements/FastTrackProgress";
import queryString from "query-string";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {ReportButton} from "../elements/ReportButton";
import classNames from "classnames";
import { RevisionWarningBanner } from "../navigation/RevisionWarningBanner";
import { LLMFreeTextQuestionInfoBanner } from "../navigation/LLMFreeTextQuestionInfoBanner";
import { LLMFreeTextQuestionIndicator } from "../elements/LLMFreeTextQuestionIndicator";
import { GameboardQuestionSidebar, MainContent, QuestionSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { StageAndDifficultySummaryIcons } from "../elements/StageAndDifficultySummaryIcons";
import { TeacherNotes } from "../elements/TeacherNotes";
import { skipToken } from "@reduxjs/toolkit/query";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";

interface QuestionPageProps extends RouteComponentProps<{questionId: string}> {
    questionIdOverride?: string;
    match: match & { params: { questionId: string } };
    preview?: boolean;
}



function getTags(docTags?: string[]) {
    if (!isPhy) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHierarchy(docTags as TAG_ID[])
        .map(tag => ({title: tag.title}));
}

export const Question = withRouter(({questionIdOverride, match, location, preview}: QuestionPageProps) => {
    const questionId = questionIdOverride || match.params.questionId;
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

    const pageContext = usePreviousPageContext(user && user.loggedIn && user.registeredContexts || undefined, doc && !isLoading ? doc : undefined);
    const {data: gameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

    return <ShowLoadingQuery
        query={questionQuery}
        defaultErrorTitle="Unable to load question"
        ifNotFound={<NotFound />}
        thenRender={supertypedDoc => {
            const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
            const isFastTrack = doc && doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;

            return <GameboardContext.Provider value={navigation.currentGameboard}>
                <Container className={classNames("no-shadow")} data-bs-theme={pageContext?.subject ?? doc.subjectId}>
                    <TitleAndBreadcrumb
                        currentPageTitle={generateQuestionTitle(doc)}
                        displayTitleOverride={siteSpecific("Question", undefined)}
                        subTitle={siteSpecific(undefined, doc.subtitle)}
                        intermediateCrumbs={navigation.breadcrumbHistory}
                        collectionType={navigation.collectionType}
                        audienceViews={siteSpecific(undefined, determineAudienceViews(doc.audience, navigation.creationContext))}
                        preview={preview} icon={{type: "hex", subject: doc.subjectId as Subject, icon: "icon-question"}}
                    />
                    {isFastTrack && fastTrackProgressEnabledBoards.includes(gameboardId || "") && <FastTrackProgress doc={doc} search={location.search} />}
                    <SidebarLayout>
                        {isDefined(gameboardId) ? <GameboardQuestionSidebar id={gameboardId} title={gameboard?.title || ""} questions={gameboard?.contents || []} currentQuestionId={questionId}/>
                            : <QuestionSidebar relatedContent={doc.relatedContent} />}
                        <MainContent>
                            {!preview && <CanonicalHrefElement />}

                            <div className={classNames("no-print d-flex align-items-center", siteSpecific("my-3", "mt-3"))}>
                                {isAda && <>
                                    {pageContainsLLMFreeTextQuestion && <span className="me-2"><LLMFreeTextQuestionIndicator /></span>}
                                    <EditContentButton doc={doc} />
                                    <div className="d-flex ms-auto">
                                        <ShareLink linkUrl={`/questions/${questionId}${location.search || ""}`} clickAwayClose />
                                        <PrintButton questionPage />
                                        <ReportButton pageId={questionId}/>
                                    </div>
                                </>}
                                {isPhy && <>
                                    <div>
                                        <h2 className="text-theme-dark"><Markup encoding="latex">{generateQuestionTitle(doc)}</Markup></h2>
                                        {doc.subtitle && <h5 className="text-theme-dark">{doc.subtitle}</h5>}
                                    </div>
                                    <div className="d-flex gap-2 ms-auto">
                                        <ShareLink linkUrl={`/questions/${questionId}${location.search || ""}`} clickAwayClose />
                                        <PrintButton questionPage />
                                        <ReportButton pageId={questionId}/>
                                    </div>
                                </>}
                            </div>

                            {isPhy && <Row className="content-metadata-container d-flex">
                                <Col xs={12} md={"auto"} className="d-flex flex-column flex-grow-1 px-3 pb-3 pb-md-0">
                                    <span>Subject & topics</span>
                                    <div className="d-flex align-items-center">
                                        <i className="icon icon-hexagon me-2"/>
                                        {getTags(doc.tags).map((tag, index, arr) => <>
                                            <span key={tag.title} className="text-theme">{tag.title}</span>
                                            {index !== arr.length - 1 && <span className="mx-2">|</span>}
                                        </>)}
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={"auto"} className="d-flex flex-column flex-grow-0 px-3 mt-3 pb-3 mt-md-0">
                                    <span>Status</span>
                                    {allQuestionsCorrect
                                        ? <div className="d-flex align-items-center"><span className="icon-correct me-2"/> Correct</div>
                                        : allQuestionsAttempted
                                            ? isPhy
                                                ? <div className="d-flex align-items-center"><span className="icon-attempted me-2"/> All attempted (some errors)</div>
                                                : <div className="d-flex align-items-center"><span className="icon-incorrect me-2"/> Incorrect</div>
                                            : anyQuestionAttempted
                                                ? <div className="d-flex align-items-center"><span className="icon-in-progress me-2"/> In progress</div>
                                                : <div className="d-flex align-items-center"><span className="icon-not-started me-2"/> Not started</div>
                                    }
                                </Col>
                                <Col xs={12} sm={6} md={"auto"} className="d-flex flex-column flex-grow-0 px-3 mt-3 mt-md-0 pb-sm-0">
                                    <span>Stage & difficulty</span>
                                    <StageAndDifficultySummaryIcons audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)} iconClassName="ps-2" stack/>
                                </Col>
                            </Row>}

                            {isPhy && <EditContentButton doc={doc} />}

                            <TeacherNotes notes={doc.teacherNotes} />

                            <Row className="question-content-container">
                                <Col className={classNames("py-4 question-panel", {"px-0 px-sm-2": isPhy}, {"mw-760": isAda})}>

                                    <SupersededDeprecatedWarningBanner doc={doc} />

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
});
