import React, { useCallback, useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Button, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isFullyDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { ListView, ListViewCards } from "../elements/list-groups/ListView";
import { getBooksForContext, getLandingPageCardsForContext } from "./subjectLandingPageComponents";
import { below, BookInfo, DOCUMENT_TYPE, EventStatusFilter, EventTypeFilter, nextSeed, STAGE, STAGE_TO_LEARNING_STAGE, useDeviceSize } from "../../services";
import { AugmentedEvent, PageContextState } from "../../../IsaacAppTypes";
import { Link } from "react-router-dom";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { searchQuestions, useAppDispatch, useAppSelector, useGetNewsPodListQuery, useLazyGetEventsQuery } from "../../state";
import { EventCard } from "../elements/cards/EventCard";
import debounce from "lodash/debounce";
import { IsaacSpinner } from "../handlers/IsaacSpinner";
import classNames from "classnames";
import { NewsCard } from "../elements/cards/NewsCard";
import { BookCard } from "./BooksOverview";
import { placeholderIcon } from "../elements/PageTitle";
import { ContentSummaryDTO, IsaacPodDTO } from "../../../IsaacApiTypes";
import {v4 as uuidV4} from "uuid";

const RandomQuestionBanner = ({context}: {context?: PageContextState}) => {
    const dispatch = useAppDispatch();
    const [randomSeed, setrandomSeed] = useState(nextSeed);

    const handleGetDifferentQuestion = () => setrandomSeed(nextSeed);
    const [searchId, setSearchId] = useState('');

    const searchDebounce = useCallback(debounce(() => {
        if (!isFullyDefinedContext(context)) {
            return;
        }

        const nextSearchId = uuidV4();
        setSearchId(nextSearchId);
        dispatch(searchQuestions({
            querySource: "randomQuestion",
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
        }, nextSearchId));
    }), [dispatch, context, randomSeed]);

    const {results: questions, searchId: questionSearchId } = useAppSelector((state) => state && state.questionSearchResult) || {};

    useEffect(() => {
        searchDebounce();
    }, [searchDebounce]);

    const question = questions?.[0];

    return <div  className="d-flex flex-column pb-4 container-override random-question-panel" >
        <div className="d-flex my-3 justify-content-between align-items-center">
            <h4 className="m-0">Try a random question!</h4>
            <button className="btn btn-link invert-underline d-flex align-items-center gap-2" onClick={handleGetDifferentQuestion}>
                Get a different question
                <i className="icon icon-refresh icon-color-black"/>
            </button>
        </div>
        {question && searchId === questionSearchId
            ? <ListView className="border-0" type="item" items={[{
                type: DOCUMENT_TYPE.QUESTION,
                title: question.title,
                tags: question.tags,
                id: question.id,
                audience: question.audience,
            } as ContentSummaryDTO]}/>
            : <ul className="w-100 list-group ">
                <li className="w-100 d-flex justify-content-center align-items-center content-summary-item list-group-item p-0">
                    <IsaacSpinner size="sm" />
                </li>
            </ul>
        }
    </div>;
};

interface FooterRowProps {
    context?: PageContextState;
    books?: BookInfo[];
    news?: IsaacPodDTO[];
    events?: AugmentedEvent[];
}

const FooterRow = ({context, books, news, events}: FooterRowProps) => {
    // this should be used under the assumption that the above props have been fetched; they may still be undefined, but they will not change

    const eventStages = (event: AugmentedEvent) => event.audience?.map(a => a.stage?.map(s => STAGE_TO_LEARNING_STAGE[s])).flat() ?? [];
    const relevantEvents = events?.filter(event =>
        context?.subject
        && event.tags?.includes(context.subject)
        && (!context?.stage?.length || eventStages(event).includes(context.stage[0]))
    ).slice(0, 2);

    const deviceSize = useDeviceSize();

    const fullWidthBooks = !relevantEvents?.length;

    return <Row className={classNames("mt-2 py-4 row-cols-1", {"row-cols-md-2": !fullWidthBooks})}>
        <div className="d-flex flex-column mt-3">
            {/* if there are books, display books. otherwise, display news */}
            {books?.length
                ? <>
                    <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                        <h4 className="m-0">Interactive online books</h4>
                        <div className="section-divider-bold flex-grow-1"/>
                    </div>
                    <div className={classNames("d-flex book-listing-container", {"flex-column col": !fullWidthBooks}, {"row-cols-1 row-cols-md-2 row": fullWidthBooks})}>
                        {books.slice(0, 4).map((book, index) => <BookCard key={index} {...book} />)}
                        {books.length > 4 && <Button tag={Link} color="keyline" to={`/books`} className="btn mt-4 mx-7">View more books</Button>}
                    </div>
                </>
                : <>
                    <div className="d-flex flex-column">
                        <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                            <h4>News & Features</h4>
                            <div className="section-divider-bold flex-grow-1"/>
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
        {!!relevantEvents?.length && <div className="d-flex flex-column mt-3">
            <div className="d-flex mb-3 align-items-center gap-4 white-space-pre">
                <h4 className="m-0">Events</h4>
                <div className="section-divider-bold flex-grow-1"/>
            </div>
            <Row className="h-100">
                {relevantEvents.map((event, i) =>
                    <Col xs={12} md={6} lg={12} key={i}>
                        {event && <EventCard event={event} className={classNames("p-2", {"force-horizontal": !["md", "xs"].includes(deviceSize)})} />}
                    </Col>
                )}
            </Row>
        </div>}
    </Row>;
};

export const LandingPageFooter = ({context}: {context: PageContextState}) => {
    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 10, typeFilter: EventTypeFilter["All groups"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);

    const books = getBooksForContext(context);
    const {data: news} = useGetNewsPodListQuery({subject: "physics"});

    return <ShowLoadingQuery
        query={eventsQuery}
        ifError={() => <FooterRow context={context} books={books} news={news} />}
        thenRender={({events}) => <FooterRow context={context} books={books} news={news} events={events} />}
    />;
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
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`,
                width: "75px",
                height: "75px",
            } : placeholderIcon({width: "75px", height: "75px"})}
        />

        {pageContext && isSingleStageContext(pageContext) && <>
            {/* Set key so the component resets questionId when the user navigates to a different subject page. Without
              * setting this, the random question will still fetch and show a spinner, but the old question is displayed
              * for just a single frame, before the useEffect takes place. */}
            <RandomQuestionBanner key={`${pageContext.stage}_${pageContext.subject}`} context={pageContext} />

            <ListViewCards cards={getLandingPageCardsForContext(pageContext, below['md'](deviceSize))} showBlanks={!below['md'](deviceSize)} className="my-7" />
            
            <LandingPageFooter context={pageContext} />
        </>}


    </Container>;
});
