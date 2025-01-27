import React, {useEffect} from "react";
import {selectors, useAppSelector, useGetNewsPodListQuery, useLazyGetEventsQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardProps, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {above, EventStatusFilter, EventTypeFilter, isLoggedIn, SITE_TITLE, STAGE, useDeviceSize} from "../../../services";
import { NewsCard } from "../../elements/cards/NewsCard";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { EventCard } from "../../elements/cards/EventCard";
import { StudentDashboard } from "../../elements/StudentDashboard";

interface HomepageHeroCardProps extends CardProps {
    title?: string;
    content?: string;
    isStudent?: boolean;
}

const HomepageHeroCard = ({title, content, isStudent}: HomepageHeroCardProps) => {
    return <Card className="homepage-hero-card">
        <CardBody>
            <span className="homepage-hero-card-tag">
                {isStudent
                    ? <>
                        <img src="/assets/phy/icons/redesign/homepage-hero-student-flag.svg" height={"40px"} style={{alignContent: "left"}} alt={"student card tag"}/>
                        <b>STUDENTS</b>
                    </>
                    : <>
                        <img src="/assets/phy/icons/redesign/homepage-hero-teacher-flag.svg" height={"40px"} style={{alignContent: "left"}} alt={"teacher card tag"}/>
                        <b>TEACHERS</b>
                    </>
                }
            </span><br/>
            <CardTitle tag="h4">{title}</CardTitle>
            <CardText>{content}</CardText>
            <Button tag={Link} to={isStudent ? "/login" : "/teacher_account_request"}>Create a {isStudent ? "student" : "teacher"} account</Button>
        </CardBody>
    </Card>;
};

const HomepageHero = () => {
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();
    if (!isLoggedIn(user)) {
        return <div className="homepage-hero">
            {above["xl"](deviceSize) && <div className="homepage-hero-img"/>}
            <div className="homepage-hero-content">
                <div className="w-100 w-xl-50 mb-6">
                    <span className="physics-strapline">
                        <h2 className="text-green">Master Science subjects</h2>
                        <h2>by solving problems</h2>
                    </span><br/>
                    <p>From School to University - <b>Isaac</b> is a free platform for teachers and students for use in the classroom, for homework and for revision.</p>
                </div>
                <Row className="row-cols-1 row-cols-md-2">
                    <Col className="mb-3">
                        <HomepageHeroCard
                            title="Build Confidence in Physics through Practice"
                            content="Tackle interactive questions, explore varying difficulty levels, and strengthen problem-solving skills with concept guides, video lessons, and events."
                            isStudent={true}/>
                    </Col>
                    <Col className="mb-3">
                        <HomepageHeroCard
                            title="Support students in developing skills and achieving higher results"
                            content="Assign, track, and manage student progress with ease—ideal for classwork, homework, or revision. Trusted by over 1,000 UK schools."
                            isStudent={false}/>
                    </Col>
                </Row>
            </div>
            
        </div>;
    }
};

export const HomepagePhy = () => {
    const user = useAppSelector(selectors.user.orNull);

    useEffect( () => {document.title = SITE_TITLE;}, []);
    const {data: news} = useGetNewsPodListQuery({subject: "physics"});

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 2, typeFilter: EventTypeFilter["All events"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);
    
    return <>
        <div id="homepage" className="homepage pb-5">
            <section id="student-dashboard">
                <StudentDashboard />
            </section>
            <section id="homepage-hero">               
                {!isLoggedIn(user) && <HomepageHero />}
            </section>
            <Container>
                <section id="explore-learn">
                    <div style={{display: "flex"}} className="mt-5">
                        <h3>Explore and learn!</h3>                                            
                        <div className="section-divider"/>
                    </div>                    
                </section>
                <section id="events-news">
                    <Row className="mt-5 row-cols-1 row-cols-lg-2">
                        <div className="mt-3">
                            <div style={{display: "flex"}}>
                                <h3>Upcoming Events</h3>
                                <Link to="/events" className="news-events-link">More events</Link>                        
                                <div className="section-divider"/>
                            </div>
                            <ShowLoadingQuery
                                query={eventsQuery}
                                defaultErrorTitle={"Error loading events list"}
                                thenRender={({events}) => {
                                    return <Row>
                                        {events.slice(0, 2).map(event => <Col key={event.id}>
                                            <EventCard event={event} />
                                        </Col>)}
                                    </Row>;
                                }}/>
                        </div>
                        <div className="mt-3"> 
                            <div style={{display: "flex"}}>
                                <h3>News & Features</h3>
                                <Link to="/news" className="news-events-link">More news</Link>                        
                                <div className="section-divider"/>
                            </div>
                            {news && <>
                                <Row>
                                    {news.slice(0, 2).map(newsItem => <Col key={newsItem.id}>
                                        <NewsCard newsItem={newsItem} />
                                    </Col>)}
                                </Row>
                            </>}
                        </div>
                    </Row>
                </section>
            </Container>
        </div>
    </>;
};
