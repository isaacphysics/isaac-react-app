import React, { useCallback, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Card, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { ListView, ListViewCards } from "../elements/list-groups/ListView";
import { getBooksForContext, getLandingPageCardsForContext } from "./subjectLandingPageComponents";
import { above, below, DOCUMENT_TYPE, EventStatusFilter, EventTypeFilter, STAGE, useDeviceSize } from "../../services";
import { PageContextState } from "../../../IsaacAppTypes";
import { PhyHexIcon } from "../elements/svg/PhyHexIcon";
import { Link } from "react-router-dom";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { searchQuestions, useAppDispatch, useAppSelector, useLazyGetEventsQuery } from "../../state";
import { EventCard } from "../elements/cards/EventCard";
import { debounce } from "lodash";
import { Loading } from "../handlers/IsaacSpinner";
import classNames from "classnames";

const handleGetDifferentQuestion = () => {
    // TODO
};

const RandomQuestionBanner = ({context}: {context?: PageContextState}) => {
    const deviceSize = useDeviceSize();
    const dispatch = useAppDispatch();

    const searchDebounce = useCallback(debounce(() => {
        dispatch(searchQuestions({
            searchString: "",
            tags: "",
            fields: undefined,
            subjects: context?.subject,
            topics: undefined,
            books: undefined,
            stages: context?.stage?.join(','),
            difficulties: undefined,
            examBoards: undefined,
            questionCategories: "problem_solving,book",
            statuses: undefined,
            fasttrack: false,
            startIndex: undefined,
            limit: 1
        }));
    }), [dispatch, context]);

    const {results: questions} = useAppSelector((state) => state && state.questionSearchResult) || {};

    useEffect(() => {
        searchDebounce();
    }, [searchDebounce]);

    if (!context || !isDefinedContext(context) || !isSingleStageContext(context)) {
        return null;
    }

    const question = questions?.[0];

    return <div className="py-4 container-override random-question-panel">
        <Row className="my-3">
            <Col lg={7}>
                <div className="d-flex justify-content-between align-items-center">
                    <h4 className="m-0">Try a random question!</h4>
                    <button className="btn btn-link invert-underline d-flex align-items-center gap-2" onClick={handleGetDifferentQuestion}>
                        Get a different question
                        <i className="icon icon-refresh icon-color-black"/>
                    </button>
                </div>
            </Col>
        </Row>
        <Row>
            <Col lg={7}>
                <Card>
                    {question 
                        ? <ListView items={[{
                            type: DOCUMENT_TYPE.QUESTION,
                            title: question.title,
                            tags: question.tags,
                            id: question.id,
                            audience: question.audience,
                        }]}/>
                        : <Loading />}
                </Card>
            </Col>
            <Col lg={5} className="ps-lg-5 m-3 m-lg-0">
                <div className="d-flex align-items-center">
                    {above['lg'](deviceSize) && <PhyHexIcon className="w-min-content" icon={"page-icon-concept"} />}
                    <h5 className="m-0">Explore related concepts:</h5>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-3">
                    {/* TODO: replace this with "recommended content" or similar */}
                    {/* {question?.relatedContent.filter(rc => rc.type === "isaacConceptPage").slice(0, 5).map((rc, i) => (
                        <Link to={`/concepts/${rc.id}`} key={i}>
                            <AffixButton key={i} color="keyline" className="px-3 py-2" affix={{
                                affix: "icon-lightbulb",
                                position: "prefix",
                                type: "icon"
                            }}>
                                {rc.title}
                            </AffixButton>
                        </Link>
                    ))} */}
                </div>
            </Col>
        </Row>
    </div>;
};

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();
    const deviceSize = useDeviceSize();

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 10, typeFilter: EventTypeFilter["All events"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);

    const books = getBooksForContext(pageContext);

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={getHumanContext(pageContext)}
            icon={pageContext?.subject ? {
                type: "img", 
                subject: pageContext.subject,
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`
            } : undefined}
        />

        <RandomQuestionBanner context={pageContext} />

        <ListViewCards cards={getLandingPageCardsForContext(pageContext, below['md'](deviceSize))} className="my-5" />
        <hr/>

        <Row className={classNames("mt-5 py-4 row-cols-1", {"row-cols-lg-2": books.length > 0})}>
            <div className="d-flex flex-column mt-3">
                <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                    <h4 className="m-0">Events</h4>
                    <div className="section-divider"/>
                </div>
                <ShowLoadingQuery
                    query={eventsQuery}
                    defaultErrorTitle={"Error loading events list"}
                    thenRender={({events}) => {
                        const relevantEvents = events.filter(event => pageContext?.subject && event.tags?.includes(pageContext.subject)).slice(0, 2);
                        return <Row className="h-100">
                            {relevantEvents.length 
                                ? relevantEvents.map((event, i) => 
                                    <Col xs={6} md={4} lg={books.length > 0 ? 6 : 4} key={i}>
                                        {event && <EventCard event={event} />}
                                    </Col>
                                ) 
                                : <Col className="pt-3 pb-5">No events found for {getHumanContext(pageContext)}. Check back soon!</Col>
                            }
                        </Row>;
                    }}
                />
            </div>
            {books.length > 0 && <div className="d-flex flex-column mt-3"> 
                <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                    <h4 className="m-0">{getHumanContext(pageContext)} books</h4>
                    <div className="section-divider"/>
                </div>
                <Row className="h-100 row-gap-3">
                    {books.slice(0, 4).map(book => <Col xs={6} key={book.title}>
                        <Link to={book.path} className="book d-flex invert-underline">
                            <img src={book.image} alt={book.title} className="w-40"/>
                            <h5 className="p-2 pb-3 m-0 align-self-center">{book.title}</h5>
                        </Link>
                    </Col>)}
                </Row>
            </div>}
        </Row>
    </Container>;
});
