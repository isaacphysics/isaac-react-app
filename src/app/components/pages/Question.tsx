import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {Col, Container, Row} from "reactstrap";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {fetchDoc, goToSupersededByQuestion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ACCEPTED_QUIZ_IDS, DOCUMENT_TYPE, TAG_ID} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {EditContentButton} from "../elements/EditContentButton";
import {TempExamBoardPicker} from "../elements/inputs/TempExamBoardPicker";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {isStudent, isTeacher} from "../../services/user";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {doc as selectDoc, userOrNull} from "../../state/selectors";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";
import tags from "../../services/tags";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

interface QuestionPageProps {
    questionIdOverride?: string;
    match: {params: {questionId: string}};
}

function getTags(docTags?: string[]) {
    if (SITE_SUBJECT !== SITE.PHY) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHeirarchy(docTags as TAG_ID[])
        .map(tag => ({title: tag.title}));
}

export const Question = withRouter(({questionIdOverride, match}: QuestionPageProps) => {
    const questionId = questionIdOverride || match.params.questionId;
    const doc = useSelector(selectDoc.ifNotAQuizId(questionId));
    const user = useSelector(userOrNull);
    const navigation = useNavigation(questionId);

    const dispatch = useDispatch();
    useEffect(() => {
        if (!ACCEPTED_QUIZ_IDS.includes(questionId)) {
            dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, questionId));
        }
    }, [questionId, dispatch]);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <div className={`pattern-01 ${doc.subjectId || ""}`}>
            <Container>
                {/*FastTrack progress bar*/}
                {/*Print options*/}
                {/*High contrast option*/}
                <TitleAndBreadcrumb
                    currentPageTitle={doc.title as string}
                    intermediateCrumbs={[
                        ...navigation.breadcrumbHistory,
                        ...getTags(doc.tags)
                    ]}
                    collectionType={navigation.collectionType}
                    level={doc.level}
                />
                <div className="no-print d-flex align-items-center">
                    <EditContentButton doc={doc} />
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/questions/${questionId}`}/>
                    </div>
                    <div className="question-actions mt-3 not_mobile">
                        <PrintButton questionPage={true}/>
                    </div>
                </div>
                <Row className="question-content-container">
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <TempExamBoardPicker className="no-print text-right"/>

                        {doc.supersededBy && !isStudent(user) && <div className="alert alert-warning">
                            {isTeacher(user) && <React.Fragment>
                                <strong>
                                    <span id="superseded-help" className="icon-help" />
                                    Teacher Note: {" "}
                                </strong>
                                <RS.UncontrolledTooltip placement="bottom" target="superseded-help">
                                    <div  className="text-left">
                                        We periodically update questions into new formats.<br />
                                        If this question appears on one of your gameboards, you may want to update the gameboard.<br />
                                        You can find help for this at Help and support &gt; Teacher Support &gt; Assigning Work.<br /><br />
                                        Students will not see this message, but will see a smaller note at the bottom of the page.
                                    </div>
                                </RS.UncontrolledTooltip>
                            </React.Fragment>}
                            This question has been replaced by {" "}
                            <RS.Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                this question
                            </RS.Button>.
                        </div>}

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

                        {doc.attribution && <p className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></p>}

                        <NavigationLinks navigation={navigation}/>

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>}
    }/>;
});
