import React, { useCallback, useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Button, Card, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isFullyDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { ListView, ListViewCards } from "../elements/list-groups/ListView";
import { getBooksForContext, getLandingPageCardsForContext } from "./subjectLandingPageComponents";
import { below, DOCUMENT_TYPE, EventStatusFilter, EventTypeFilter, nextSeed, STAGE, useDeviceSize } from "../../services";
import { AugmentedEvent, PageContextState } from "../../../IsaacAppTypes";
import { Link } from "react-router-dom";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { searchQuestions, useAppDispatch, useAppSelector, useGetNewsPodListQuery, useLazyGetEventsQuery } from "../../state";
import { EventCard } from "../elements/cards/EventCard";
import debounce from "lodash/debounce";
import { Loading } from "../handlers/IsaacSpinner";
import classNames from "classnames";
import { NewsCard } from "../elements/cards/NewsCard";
import { Stage } from "../../../IsaacApiTypes";


const RandomQuestionBanner = ({context}: {context?: PageContextState}) => {
    const dispatch = useAppDispatch();
    const [randomSeed, setrandomSeed] = useState(nextSeed);

    const handleGetDifferentQuestion = () => setrandomSeed(nextSeed);

    const searchDebounce = useCallback(debounce(() => {
        if (!isFullyDefinedContext(context)) {
            return;
        }

        dispatch(searchQuestions({
            searchString: "",
            tags: "",
            fields: undefined,
            subjects: context?.subject,
            topics: undefined,
            books: undefined,
            stages: context?.stage?.map(s => s === "11_14" ? "year_7_and_8,year_9" : s).join(','),
            difficulties: undefined,
            examBoards: undefined,
            questionCategories: "problem_solving,book",
            statuses: undefined,
            fasttrack: false,
            startIndex: undefined,
            limit: 1,
            randomSeed
        }));
    }), [dispatch, context, randomSeed]);

    const {results: questions} = useAppSelector((state) => state && state.questionSearchResult) || {};

    useEffect(() => {
        searchDebounce();
    }, [searchDebounce]);

    if (!context || !isFullyDefinedContext(context) || !isSingleStageContext(context)) {
        return null;
    }

    const question = questions?.[0];

    return <div className="py-4 container-override random-question-panel">
        <Row className="my-3">
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">Try a random question!</h4>
                <button className="btn btn-link invert-underline d-flex align-items-center gap-2" onClick={handleGetDifferentQuestion}>
                    Get a different question
                    <i className="icon icon-refresh icon-color-black"/>
                </button>
            </div>
        </Row>
        <Row style={{margin: "auto"}}>
            <Card className="px-0">
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
        </Row>
    </div>;
};

export const LandingPageFooter = ({context}: {context: PageContextState}) => {
    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 10, typeFilter: EventTypeFilter["All groups"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);

    const books = getBooksForContext(context);
    // TODO: are we going to make subject-specific news?
    const {data: news} = useGetNewsPodListQuery({subject: "physics"});

    return <Row className={classNames("mt-5 py-4 row-cols-1 row-cols-md-2")}>
        <div className="d-flex flex-column mt-3">
            {/* if there are books, display books. otherwise, display news */}
            {books.length > 0
                ? <>
                    <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                        <h4 className="m-0">{getHumanContext(context)} books</h4>
                        <div className="section-divider-bold"/>
                    </div>
                    <Col className="d-flex flex-column">
                        {books.slice(0, 2).map((book, index) => <Link key={index} to={book.path} className="book-container d-flex p-2 gap-3">
                            <div className="book-image-container">
                                <img src={book.image} alt={book.title} className="h-100"/>
                            </div>
                            <div className="d-flex flex-column">
                                <h5 className="pt-2 pt-2 pb-1 m-0">{book.title}</h5>
                                <div className="section-divider"/>
                                <span className="text-decoration-none">
                                    This is some explanatory text about the book. It could be a brief description of the book, or a list of topics covered.
                                </span>
                            </div>
                        </Link>)}
                        {books.length > 2 && <Button tag={Link} color="keyline" to={`/publications`} className="btn mt-4 mx-5">View more books</Button>}
                    </Col>
                </>
                : <>
                    <div className="d-flex flex-column">
                        <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                            <h4>News & Features</h4>
                            <div className="section-divider-bold"/>
                        </div>
                        {news && <Row className="h-100">
                            {news.slice(0, 2).map(newsItem => <Col xs={12} key={newsItem.id}>
                                <NewsCard newsItem={newsItem} className="force-horizontal p-2" />
                            </Col>)}
                        </Row>}
                    </div>
                </>
            }
        </div>
        <div className="d-flex flex-column mt-3">
            <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                <h4 className="m-0">Events</h4>
                <div className="section-divider-bold"/>
            </div>
            <ShowLoadingQuery
                query={eventsQuery}
                defaultErrorTitle={"Error loading events list"}
                thenRender={({events}) => {
                    const eventStages = (event: AugmentedEvent) => event.audience?.map(a => a.stage).flat() ?? [];
                    const relevantEvents = events.filter(event => context?.subject && event.tags?.includes(context.subject)
                        && (!context?.stage?.length || eventStages(event).includes(context.stage[0] as Stage))).slice(0, 2);
                    return <Row className="h-100">
                        {relevantEvents.length
                            ? relevantEvents.map((event, i) =>
                                <Col xs={12} key={i}>
                                    {event && <EventCard event={event} className="force-horizontal p-2" />}
                                </Col>
                            )
                            : <Col className="pt-3 pb-5">No events found for {getHumanContext(context)}. Check back soon!</Col>
                        }
                    </Row>;
                }}
            />
        </div>
    </Row>;
};

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();
    const deviceSize = useDeviceSize();

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

        <ListViewCards cards={getLandingPageCardsForContext(pageContext, below['md'](deviceSize))} showBlanks={!below['md'](deviceSize)} className="my-5" />

        <LandingPageFooter context={pageContext} />


    </Container>;
});
