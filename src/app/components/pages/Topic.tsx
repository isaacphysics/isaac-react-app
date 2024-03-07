import React, {useEffect} from "react"
import {Link, withRouter} from "react-router-dom";
import {AppState, fetchTopicSummary, selectors, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {
    ALL_TOPICS_CRUMB,
    atLeastOne,
    examBoardLabelMap,
    getRelatedDocs,
    NOT_FOUND, PATHS,
    stageLabelMap,
    TAG_ID,
    useUserContext
} from "../../services";
import {Button, Card, CardBody, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {UserContextPicker} from "../elements/inputs/UserContextPicker";
import {TopicSummaryLinks} from "../elements/list-groups/TopicSummaryLinks";
import {CanonicalHrefElement} from "../navigation/CanonicalHrefElement";
import {MetaDescription} from "../elements/MetaDescription";

export const Topic = withRouter(({match: {params: {topicName}}}: {match: {params: {topicName: TAG_ID}}}) => {
    const dispatch = useAppDispatch();
    const topicPage = useAppSelector((state: AppState) => state ? state.currentTopic : null);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();

    useEffect(() => {dispatch(fetchTopicSummary(topicName));}, [dispatch, topicName]);

    const [relatedConcepts, relatedQuestions] = getRelatedDocs(topicPage, userContext, user);
    const [relatedConceptsForSpecificViewingContext, relatedQuestionsForSpecificViewingContext] =
        getRelatedDocs(topicPage, {...userContext, showOtherContent: false}, user);

    const searchQuery = `?topic=${topicName}`;
    const linkedRelevantGameboards = topicPage && topicPage != NOT_FOUND && topicPage.linkedGameboards && topicPage.linkedGameboards;

    return <ShowLoading until={topicPage} thenRender={topicPage =>
        <Container id="topic-page">
            <TitleAndBreadcrumb intermediateCrumbs={[ALL_TOPICS_CRUMB]} currentPageTitle={topicPage.title as string}/>
            <MetaDescription description={topicPage.summary} />
            <CanonicalHrefElement />
            <Row>
                <Col className={"py-3 mw-760"}>
                    <div className="d-flex justify-content-end">
                        <UserContextPicker />
                    </div>
                    {topicPage.children && topicPage.children.map((child, index) =>
                        <IsaacContent key={index} doc={child}/>)
                    }
                    {!(atLeastOne(relatedConceptsForSpecificViewingContext.length) || atLeastOne(relatedQuestionsForSpecificViewingContext.length)) &&
                        <div className='text-center mt-3'>
                            <div className='alert alert-warning'>
                                {`There is no material in this topic for ${stageLabelMap[userContext.stage]} ${examBoardLabelMap[userContext.examBoard]}. ` +
                                "You can change your viewing preferences "}
                                <strong>by updating your <a href="/account#customise">profile</a></strong>
                            </div>
                        </div>
                    }
                    {atLeastOne(relatedConcepts.length) &&
                        <TopicSummaryLinks items={relatedConcepts} search={searchQuery} />
                    }
                    {atLeastOne(relatedQuestions.length) &&
                        <TopicSummaryLinks items={relatedQuestions} search={searchQuery} />
                    }
                </Col>
            </Row>

            {linkedRelevantGameboards && linkedRelevantGameboards.length > 0 && <Row className="mb-3">
                <Col className={"py-0 mw-760"}>
                    <Card className="board-card card-neat">
                        <CardBody className="pb-4 pt-4">
                            <CardTitle>Gameboards</CardTitle>
                            <p>You can work through individual questions or try a group of questions by clicking on the topic gameboards below.</p>
                            <ul>{linkedRelevantGameboards.map((gameboard, i) => <div key={gameboard.id || i}>
                                {user?.loggedIn && user?.role !== "STUDENT" &&
                                    <li>
                                        <strong>{gameboard.title || '-'}</strong> &mdash; <Link to={`${PATHS.GAMEBOARD}#${gameboard.id}`}>Preview</Link> | <Link to={`${PATHS.ADD_GAMEBOARD}/${gameboard.id}`}>Assign</Link>
                                    </li>
                                }
                                {(!user?.loggedIn || user?.role === "STUDENT") &&
                                    <li><strong><Link to={`${PATHS.GAMEBOARD}#${gameboard.id}`}>{gameboard.title || '-'}</Link></strong></li>
                                }
                            </div>)}</ul>
                        </CardBody>
                    </Card>
                </Col>
            </Row>}

            <Row className="mt-3 mb-5">
                <Col className={"pb-3 mw-760"}>
                    <Row>
                        <Col size={6} className="text-center">
                            <Button tag={Link} to="/topics" color="primary" outline size="lg" block>
                                <span className="d-none d-md-inline">Back to</span> {" "} All topics
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    } />;
});
