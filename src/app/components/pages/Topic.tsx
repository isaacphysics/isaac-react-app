import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicSummary} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {filterAndSeparateRelatedContent} from "../../services/topics";
import {Button, Col, Container, Row} from "reactstrap";
import {ALL_TOPICS_CRUMB, examBoardTagMap, NOT_FOUND, TAG_ID} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AnonUserExamBoardPicker} from "../elements/inputs/AnonUserExamBoardPicker";
import {atLeastOne} from "../../services/validation";
import {useCurrentExamBoard} from "../../services/examBoard";

export const Topic = withRouter(({match: {params: {topicName}}}: {match: {params: {topicName: TAG_ID}}}) => {
    const dispatch = useDispatch();
    const topicPage = useSelector((state: AppState) => state ? state.currentTopic : null);

    const examBoard = useCurrentExamBoard();

    useEffect(
        () => {dispatch(fetchTopicSummary(topicName))},
        [topicName]
    );

    let [relatedConcepts, relatedQuestions]: [ContentSummaryDTO[] | null, ContentSummaryDTO[] | null] = [null, null];
    if (topicPage && topicPage != NOT_FOUND && topicPage.relatedContent) {
        [relatedConcepts, relatedQuestions] = topicPage.relatedContent &&
            filterAndSeparateRelatedContent(topicPage.relatedContent, examBoard);
    }
    const searchQuery = `?topic=${topicName}`;
    const linkedRelevantGameboards = topicPage && topicPage != NOT_FOUND && topicPage.linkedGameboards && topicPage.linkedGameboards.filter((gameboard) => {
        return gameboard.tags && gameboard.tags.includes(examBoardTagMap[examBoard]);
    });

    return <ShowLoading until={topicPage} thenRender={topicPage =>
        <Container id="topic-page">
            <TitleAndBreadcrumb intermediateCrumbs={[ALL_TOPICS_CRUMB]} currentPageTitle={topicPage.title as string}/>
            <Row className="pb-5">
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }
                    <AnonUserExamBoardPicker className="text-right" />

                    {relatedConcepts && atLeastOne(relatedConcepts.length) &&
                        <LinkToContentSummaryList items={relatedConcepts} search={searchQuery} className="my-4" />
                    }
                    {relatedQuestions && atLeastOne(relatedQuestions.length) &&
                        <LinkToContentSummaryList items={relatedQuestions} search={searchQuery} className="my-4" />
                    }

                    <Row>
                        <Col size={6} className="text-center">
                            <Button tag={Link} to="/topics" color="primary" outline size="lg" className="my-4" block>
                                <span className="d-none d-md-inline">Back to</span> {" "} All topics
                            </Button>
                        </Col>
                        {linkedRelevantGameboards && linkedRelevantGameboards.length > 0 && <Col size={6} className="text-center">
                            <Button tag={Link} to={`/gameboards#${linkedRelevantGameboards[0].id}`} color="secondary" size="lg" className="my-4" block>
                                Topic gameboard
                            </Button>
                        </Col>}
                    </Row>
                </Col>
            </Row>
        </Container>
    } />;
});
