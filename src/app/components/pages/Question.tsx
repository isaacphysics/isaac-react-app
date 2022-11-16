import React from "react";
import * as RS from "reactstrap";
import {Col, Container, Row} from "reactstrap";
import {match, RouteComponentProps, withRouter} from "react-router-dom";
import {goToSupersededByQuestion, isaacApi, selectors, useAppDispatch, useAppSelector} from "../../state";
import {
    determineAudienceViews,
    DOCUMENT_TYPE,
    fastTrackProgressEnabledBoards,
    generateQuestionTitle,
    isPhy,
    isStudent,
    siteSpecific,
    TAG_ID,
    tags,
    useNavigation
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {GameboardContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import {FastTrackProgress} from "../elements/FastTrackProgress";
import queryString from "query-string";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {ReportButton} from "../elements/ReportButton";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

interface QuestionPageProps extends RouteComponentProps<{questionId: string}> {
    questionIdOverride?: string;
    match: match & { params: { questionId: string } };
}



function getTags(docTags?: string[]) {
    if (!isPhy) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHierarchy(docTags as TAG_ID[])
        .map(tag => ({title: tag.title}));
}

export const Question = withRouter(({questionIdOverride, match, location}: QuestionPageProps) => {
    const questionId = questionIdOverride || match.params.questionId;
    const doc = useAppSelector(selectors.doc.get);
    const user = useAppSelector(selectors.user.orNull);
    const navigation = useNavigation(doc);
    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;

    const dispatch = useAppDispatch();
    const questionQuery = isaacApi.endpoints.getQuestion.useQuery(questionId);

    return <ShowLoadingQuery
        query={questionQuery}
        defaultErrorTitle={"Error fetching question page"}
        thenRender={doc => {
            const isFastTrack = doc && doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;
            return <div className={`pattern-01 ${doc.subjectId || ""}`}>
                <GameboardContext.Provider value={navigation.currentGameboard}>
                    <Container>
                        {/*High contrast option*/}
                        <TitleAndBreadcrumb
                            currentPageTitle={generateQuestionTitle(doc)}
                            intermediateCrumbs={[...navigation.breadcrumbHistory, ...getTags(doc.tags)]}
                            collectionType={navigation.collectionType}
                            audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)}
                        >
                            {isFastTrack && fastTrackProgressEnabledBoards.includes(gameboardId || "") && <FastTrackProgress doc={doc} search={location.search} />}
                        </TitleAndBreadcrumb>
                        <CanonicalHrefElement />
                        <div className="no-print d-flex align-items-center mt-3">
                            <EditContentButton doc={doc} />
                            <div className="question-actions ml-auto">
                                <ShareLink linkUrl={`/questions/${questionId}${location.search || ""}`} clickAwayClose />
                            </div>
                            <div className="question-actions not-mobile">
                                <PrintButton questionPage />
                            </div>
                            <div className="question-actions">
                                <ReportButton pageId={questionId}/>
                            </div>
                        </div>
                        <Row className="question-content-container">
                            <Col md={siteSpecific({size: 12}, {size: 8, offset: 2})} className="py-4 question-panel">

                                <SupersededDeprecatedWarningBanner doc={doc} />

                                <IntendedAudienceWarningBanner doc={doc} />

                                <WithFigureNumbering doc={doc}>
                                    <IsaacContent doc={doc}/>
                                </WithFigureNumbering>

                                {doc.supersededBy && isStudent(user) && <div className="alert alert-warning">
                                    This question {" "}
                                    <RS.Button color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                        has been replaced
                                    </RS.Button>.<br />
                                    However, if you were assigned this version, you should complete it.
                                </div>}

                                {doc.attribution && <p className="text-muted">
                                    <Markup trusted-markup-encoding={"markdown"}>
                                        {doc.attribution}
                                    </Markup>
                                </p>}

                                <NavigationLinks navigation={navigation}/>

                                {doc.relatedContent && !isFastTrack && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                            </Col>
                        </Row>
                    </Container>
                </GameboardContext.Provider>
            </div>;
    }} />;
});
