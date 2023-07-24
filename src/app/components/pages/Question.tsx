import React from "react";
import * as RS from "reactstrap";
import {Col, Container, Row} from "reactstrap";
import {match, RouteComponentProps, withRouter} from "react-router-dom";
import {
    goToSupersededByQuestion,
    selectors, useAppDispatch,
    useAppSelector,
    useGetQuestionPageQuery
} from "../../state";
import {
    determineAudienceViews,
    DOCUMENT_TYPE,
    fastTrackProgressEnabledBoards,
    generateQuestionTitle,
    isAda,
    isPhy,
    isStudent,
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
import {GameboardContext, PageContext} from "../../../IsaacAppTypes";
import {Markup} from "../elements/markup";
import {FastTrackProgress} from "../elements/FastTrackProgress";
import queryString from "query-string";
import {IntendedAudienceWarningBanner} from "../navigation/IntendedAudienceWarningBanner";
import {SupersededDeprecatedWarningBanner} from "../navigation/SupersededDeprecatedWarningBanner";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {ReportButton} from "../elements/ReportButton";
import classNames from "classnames";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {NotFound} from "./NotFound";

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
    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;

    const dispatch = useAppDispatch();
    const docQuery = useGetQuestionPageQuery(questionId);
    const user = useAppSelector(selectors.user.orNull);
    const navigation = useNavigation(docQuery.data);

    return <ShowLoadingQuery
        query={docQuery}
        ifNotFound={<NotFound/>}
        ifError={NotFound}
        thenRender={doc => {
            const isFastTrack = doc && doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;

            return <GameboardContext.Provider value={navigation.currentGameboard}>
                <PageContext.Provider value={{id: doc.id, type: doc.type as DOCUMENT_TYPE, level: doc.level}}>
                    <Container className={`${doc.subjectId || ""}`}>
                        {/*High contrast option*/}
                        <TitleAndBreadcrumb
                              currentPageTitle={generateQuestionTitle(doc)}
                              intermediateCrumbs={[...navigation.breadcrumbHistory, ...getTags(doc.tags)]}
                              collectionType={navigation.collectionType}
                              audienceViews={determineAudienceViews(doc.audience, navigation.creationContext)}
                              preview={preview}
                          >
                            {isFastTrack && fastTrackProgressEnabledBoards.includes(gameboardId || "") && <FastTrackProgress doc={doc} search={location.search} />}
                        </TitleAndBreadcrumb>
                        {!preview && <CanonicalHrefElement />}
                        <div className="no-print d-flex flex-wrap align-items-center mt-3">
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
                            <Col className={classNames("py-4 question-panel", {"mw-760": isAda})}>

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
                </PageContext.Provider>
            </GameboardContext.Provider>;
        }}
    />;
});
