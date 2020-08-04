import React, {useEffect, useState} from "react"
import {Link, withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {fetchTopicSummary, setTempExamBoard} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {LinkToContentSummaryList} from "../elements/list-groups/ContentSummaryListGroupItem";
import {getRelatedDocs} from "../../services/topics";
import {Button, Col, Container, Row, Card, CardBody, CardTitle, Nav, NavItem, NavLink} from "reactstrap";
import {ALL_TOPICS_CRUMB, examBoardTagMap, NOT_FOUND, TAG_ID, EXAM_BOARD} from "../../services/constants";
import {useCurrentExamBoard} from "../../services/examBoard";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {TempExamBoardPicker} from "../elements/inputs/TempExamBoardPicker";
import {atLeastOne} from "../../services/validation";
import {selectors} from '../../state/selectors';

export const Topic = withRouter(({match: {params: {topicName}}}: {match: {params: {topicName: TAG_ID}}}) => {
    const dispatch = useDispatch();
    const topicPage = useSelector((state: AppState) => state ? state.currentTopic : null);
    const user = useSelector(selectors.user.orNull);
    let examBoard = useCurrentExamBoard();

    useEffect(
        () => {dispatch(fetchTopicSummary(topicName))},
        [dispatch, topicName]
    );

    let [relatedConcepts, relatedQuestions] = getRelatedDocs(topicPage, examBoard);

    const searchQuery = `?topic=${topicName}`;
    const linkedRelevantGameboards = topicPage && topicPage != NOT_FOUND && topicPage.linkedGameboards && topicPage.linkedGameboards.filter((gameboard) => {
        return gameboard.tags && gameboard.tags.includes(examBoardTagMap[examBoard]);
    });

    return <ShowLoading until={topicPage} thenRender={topicPage =>
        <Container id="topic-page">
            <TitleAndBreadcrumb intermediateCrumbs={[ALL_TOPICS_CRUMB]} currentPageTitle={topicPage.title as string}/>
            <Row className="pb-3">
                <Col md={{size: 8, offset: 2}} className="py-3">
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }
                    <TempExamBoardPicker className="text-right" />

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
                </Col>
            </Row>

            {linkedRelevantGameboards && linkedRelevantGameboards.length > 0 && <Row className="pb-2">
                <Col md={{size: 8, offset: 2}} className="py-0">
                    <Card className="board-card card-neat">
                        <CardBody className="pb-4 pt-4">
                            <CardTitle>Gameboards</CardTitle>
                            <p>You can work through the individual questions above or try a group of questions by clicking on the topic gameboards below.</p>
                            <ul>{linkedRelevantGameboards.map((gameboard, i) => <div key={gameboard.id || i}>
                                {user?.loggedIn && user?.role !== "STUDENT" &&
                                    <li>
                                        <strong>{gameboard.title || '-'}</strong> &mdash; <Link to={`/gameboards#${gameboard.id}`}>Preview</Link> | <Link to={`/add_gameboard/${gameboard.id}`}>Assign</Link>
                                    </li>
                                }
                                {(!user?.loggedIn || user?.role === "STUDENT") &&
                                    <li><strong><Link to={`/gameboards#${gameboard.id}`}>{gameboard.title || '-'}</Link></strong></li>
                                }
                            </div>)}</ul>
                        </CardBody>
                    </Card>
                </Col>
            </Row>}
            
            <Row className="pb-5">
                <Col md={{size: 8, offset: 2}} className="py-3">

                    <Row>
                        <Col size={6} className="text-center">
                            <Button tag={Link} to="/topics" color="primary" outline size="lg" className="my-4" block>
                                <span className="d-none d-md-inline">Back to</span> {" "} All topics
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    } />;
});
