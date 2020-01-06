import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicSummary} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {ContentSummaryDTO, IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {filterAndSeparateRelatedContent} from "../../services/topics";
import {Button, Col, Container, Row} from "reactstrap";
import {ALL_TOPICS_CRUMB, NOT_FOUND, TAG_ID} from "../../services/constants";
import {NOT_FOUND_TYPE, UserPreferencesDTO} from "../../../IsaacAppTypes";
import {determineExamBoardFrom} from "../../services/examBoard";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {AnonUserExamBoardPicker} from "../elements/inputs/AnonUserExamBoardPicker";
import {atLeastOne} from "../../services/validation";

const stateToProps = (state: AppState, {match: {params: {topicName}}}: {match: {params: {topicName: TAG_ID}}}) => ({
    topicName: topicName,
    topicPage: state ? state.currentTopic : null,
    userPreferences: state ? state.userPreferences : null
});
const actionsToProps = {fetchTopicSummary};

interface TopicPageProps {
    topicName: TAG_ID;
    topicPage: IsaacTopicSummaryPageDTO | NOT_FOUND_TYPE | null;
    fetchTopicSummary: (topicId: TAG_ID) => void;
    userPreferences: UserPreferencesDTO | null;
}
const TopicPageComponent = ({topicName, topicPage, fetchTopicSummary, userPreferences}: TopicPageProps) => {
    useEffect(
        () => {fetchTopicSummary(topicName)},
        [topicName]
    );

    const examBoard = determineExamBoardFrom(userPreferences);

    let [relatedConcepts, relatedQuestions]: [ContentSummaryDTO[] | null, ContentSummaryDTO[] | null] = [null, null];
    if (topicPage && topicPage != NOT_FOUND && topicPage.relatedContent) {
        [relatedConcepts, relatedQuestions] = topicPage.relatedContent &&
            filterAndSeparateRelatedContent(topicPage.relatedContent, examBoard);
    }
    const searchQuery = `?topic=${topicName}`;

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
                    {(!relatedQuestions || !atLeastOne(relatedQuestions.length)) &&
                        (!relatedConcepts || !atLeastOne(relatedConcepts.length)) && <div className='text-center py-3'>
                        <div className='alert alert-warning'>
                            There is no material in this topic for the {examBoard} exam board.
                        </div>
                    </div>
                    }

                    <Row>
                        <Col size={6} className="text-center">
                            <Button tag={Link} to="/topics" color="primary" outline size="lg" className="my-4" block>
                                <span className="d-none d-md-inline">Back to</span> {" "} All topics
                            </Button>
                        </Col>
                        {topicName != TAG_ID.softwareProject && <Col size={6} className="text-center">
                            <Button tag={Link} to={`/gameboards#${topicName}_july19_${examBoard.toLowerCase()}`} color="secondary" size="lg" className="my-4" block>
                                Topic gameboard
                            </Button>
                        </Col>}
                    </Row>
                </Col>
            </Row>
        </Container>
    } />;
};

export const Topic = withRouter(connect(stateToProps, actionsToProps)(TopicPageComponent));
