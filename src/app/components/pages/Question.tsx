import React, {useEffect} from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {match, RouteComponentProps, withRouter} from "react-router-dom";
import {fetchDoc, goToSupersededByQuestion, selectors, useAppDispatch, useAppSelector, useGetGameboardByIdQuery} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
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
import { GameboardSidebar, MainContent, QuestionSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { StageAndDifficultySummaryIcons } from "../elements/StageAndDifficultySummaryIcons";
import { skipToken } from "@reduxjs/toolkit/query";

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
    const doc = useAppSelector(selectors.doc.get);
    const user = useAppSelector(selectors.user.orNull);
    const prevPageContext = useAppSelector(selectors.pageContext.context);
    const allQuestionsCorrect = useAppSelector(selectors.questions.allQuestionsCorrect);
    const anyQuestionAttempted = useAppSelector(selectors.questions.anyQuestionPreviouslyAttempted);
    const navigation = useNavigation(doc);
    const pageContainsLLMFreeTextQuestion = useAppSelector(selectors.questions.includesLLMFreeTextQuestion);
    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, questionId));
    }, [dispatch, questionId]);

    const pageContext = usePreviousPageContext(user && user.loggedIn && user.registeredContexts || undefined, doc && doc !== 404 ? doc : undefined);
    const {data: gameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        const isFastTrack = doc && doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;

        return <GameboardContext.Provider value={navigation.currentGameboard}>
            <Container className={classNames("no-shadow")} data-bs-theme={pageContext?.subject ?? doc.subjectId}>
                <TitleAndBreadcrumb
                    currentPageTitle={siteSpecific("Question", generateQuestionTitle(doc))}
                    subTitle={siteSpecific(undefined, doc.subtitle)}
                    intermediateCrumbs={siteSpecific([...navigation.breadcrumbHistory], [...navigation.breadcrumbHistory, ...getTags(doc.tags)])}
                    collectionType={navigation.collectionType}
                    audienceViews={siteSpecific(undefined, determineAudienceViews(doc.audience, navigation.creationContext))}
                    preview={preview} icon={{type: "hex", subject: doc.subjectId as Subject, icon: "page-icon-question"}}
                />
                {isFastTrack && fastTrackProgressEnabledBoards.includes(gameboardId || "") && <FastTrackProgress doc={doc} search={location.search} />}
                <SidebarLayout>
                    {isDefined(gameboardId) ? <GameboardSidebar id={gameboard?.id} title={gameboard?.title} questions={gameboard?.contents}/> : <QuestionSidebar relatedContent={doc.relatedContent} />}
                    <MainContent>
                        {!preview && <CanonicalHrefElement />}

                        <div className="no-print d-flex align-items-center mt-3">
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
                                    <h2 className="text-theme-dark mb-4">{generateQuestionTitle(doc)}</h2>
                                    {doc.subtitle && <h5 className="text-theme-dark">{doc.subtitle}</h5>}
                                </div>
                                <div className="d-flex gap-2 ms-auto">
                                    <ShareLink linkUrl={`/questions/${questionId}${location.search || ""}`} clickAwayClose />
                                    <PrintButton questionPage />
                                    <ReportButton pageId={questionId}/>
                                </div>
                            </>}
                        </div>
                        
                        {isPhy && <Row className="question-metadata d-flex">
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
                            <Col xs={12} sm={6} md={"auto"} className="d-flex flex-column flex-grow-0 px-3 mt-3 pb-3 mt-md-0 pb-sm-0">
                                <span>Stage & difficulty</span>
                                <StageAndDifficultySummaryIcons audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)} iconClassName="ps-2" stack/> 
                            </Col>
                            <Col xs={12} sm={6} md={"auto"} className="d-flex flex-column flex-grow-0 px-3 mt-3 mt-md-0">
                                <span>Status</span>
                                {allQuestionsCorrect 
                                    ? <div className="d-flex align-items-center"><span className="icon-correct me-2"/> Correct</div>
                                    : anyQuestionAttempted
                                        ? <div className="d-flex align-items-center"><span className="icon-in-progress me-2"/> In Progress</div>
                                        : <div className="d-flex align-items-center"><span className="icon-not-started me-2"/> Not Started</div>
                                }
                            </Col>
                        </Row>}

                        {isPhy && <EditContentButton doc={doc} />}

                        <Row className="question-content-container">
                            <Col className={classNames("py-4 question-panel", {"mw-760": isAda})}>

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
    } />;
});
