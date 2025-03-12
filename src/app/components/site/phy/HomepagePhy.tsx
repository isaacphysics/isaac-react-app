import React, {useEffect, useState} from "react";
import {selectors, useAppSelector, useGetNewsPodListQuery, useLazyGetEventsQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardProps, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {above, EventStatusFilter, EventTypeFilter, extractTeacherName, HUMAN_STAGES, HUMAN_SUBJECTS, isLoggedIn, isTutorOrAbove, PHY_NAV_SUBJECTS, SITE_TITLE, STAGE, Subject, useDeviceSize} from "../../../services";
import { NewsCard } from "../../elements/cards/NewsCard";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { EventCard } from "../../elements/cards/EventCard";
import { StudentDashboard } from "../../elements/StudentDashboard";
import { ShortcutResponse } from "../../../../IsaacAppTypes";
import { ListViewCardProps, ListViewCards } from "../../elements/list-groups/ListView";
import { Spacer } from "../../elements/Spacer";
import { TeacherDashboard } from "../../elements/TeacherDashboard";
import StyledToggle from "../../elements/inputs/StyledToggle";
import { UserSummaryDTO } from "../../../../IsaacApiTypes";

interface HomepageHeroCardProps extends CardProps {
    title?: string;
    content?: string;
    isStudent?: boolean;
}

const HomepageHeroCard = ({title, content, isStudent}: HomepageHeroCardProps) => {
    return <Card className="homepage-hero-card border-0">
        <CardBody className="p-4 pt-5 d-flex flex-column">
            <div className="homepage-hero-card-tag">
                {isStudent
                    ? <>
                        <img src="/assets/phy/icons/redesign/homepage-hero-student-flag.svg" height={"40px"} alt={"student card tag"}/>
                        <b>STUDENTS</b>
                    </>
                    : <>
                        <img src="/assets/phy/icons/redesign/homepage-hero-teacher-flag.svg" height={"40px"} alt={"teacher card tag"}/>
                        <b>TEACHERS</b>
                    </>
                }
            </div>
            <CardTitle className="mt-1" tag="h4">{title}</CardTitle>
            <CardText>{content}</CardText>
            <Spacer/>
            <Button className="w-max-content" tag={Link} to={isStudent ? "/login" : "/teacher_account_request"}>Create a {isStudent ? "student" : "teacher"} account</Button>
        </CardBody>
    </Card>;
};

const HomepageHero = () => {
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();
    if (!isLoggedIn(user)) {
        return <div className="homepage-hero">
            {above['md'](deviceSize) && <div className="homepage-hero-img"/>}
            <Container className="pt-5">
                <div className="w-100 w-md-50 mb-4 mb-md-5 mb-xl-6 pe-xl-5">
                    <div className="physics-strapline mb-3">
                        <h2><span className="text-green">Master Science subjects</span> by solving problems</h2>
                    </div>
                    From School to University – <b>Isaac</b> is a free platform for teachers and students for use in the classroom, for homework and for revision.
                </div>
                {!above['md'](deviceSize) && <div className="homepage-hero-img container-override"/>}
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
            </Container>           
        </div>;
    }
};

const Dashboard = () => {
    const user = useAppSelector(selectors.user.orNull);
    const [studentView, setStudentView] = useState(false);
    if (isLoggedIn(user)) {
        if (isTutorOrAbove(user)) {
            return <>
                <div className="dashboard-toggle">
                    Dashboard view <Spacer />
                    <StyledToggle
                        checked={studentView}
                        falseLabel="Teacher"
                        trueLabel="Student"
                        onChange={() => setStudentView(studentView => !studentView)}             
                    />
                </div>
                {studentView ? <StudentDashboard /> : <TeacherDashboard />}
            </>;
        }
        else {
            return <StudentDashboard />;
        }
    }
};

type subjectCategory = {subject: string, humanSubject: string, subcategories: {humanStage: string, href: string}[]};
const subjectCategories = Object.entries(PHY_NAV_SUBJECTS).map(([subject, stages]) => {
    return {
        subject: subject,
        humanSubject: HUMAN_SUBJECTS[subject],
        subcategories: stages.map((stage) => {
            return {
                humanStage: HUMAN_STAGES[stage.valueOf()],
                href: `/${subject}/${stage}`,
            };
        })
    };
});

const getListViewSubjectCard = (sc: subjectCategory) => {
    const item: ShortcutResponse = {
        title: sc.humanSubject,
        subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus est vulputate augue tristique, sed vehicula turpis pellentesque.",
    };

    const listViewSubjectCard: ListViewCardProps = {
        item: item,
        icon: {type: "img", icon: `/assets/phy/icons/redesign/subject-${sc.subject}.svg`},
        subject: sc.subject as Subject,
        linkTags: sc.subcategories.map((subcat) => ({tag: subcat.humanStage, url: subcat.href})),
        url: `/${sc.subject}`,
    };

    return listViewSubjectCard;
};

const cards = subjectCategories.map((sc) => getListViewSubjectCard(sc));

export const HomepagePhy = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);

    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = isLoggedIn(user) && (isTutorOrAbove(user) ? extractTeacherName(user as UserSummaryDTO) : user.givenName);
    
    const {data: news} = useGetNewsPodListQuery({subject: "physics"});

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 2, typeFilter: EventTypeFilter["All groups"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);
    
    return <>
        <div id="homepage" className="homepage pb-5">
            <section id="dashboard">
                {nameToDisplay && <div className="welcome-text">Welcome back, {nameToDisplay}!</div>}
                <Dashboard />
            </section>
            <section id="homepage-hero">               
                {!isLoggedIn(user) && <HomepageHero />}
            </section>
            <Container>
                <section id="explore-learn">
                    <div className="mt-5">
                        <div className="d-flex">
                            <h3>Explore and learn!</h3>
                            <div className="section-divider ms-2"/>
                        </div>
                        <ListViewCards cards={cards}/>                                         
                    </div>                    
                </section>
                <section id="events-news">
                    <Row className="mt-5 row-cols-1 row-cols-lg-2">
                        <div className="d-flex flex-column mt-3">
                            <div className="d-flex">
                                <h3>Upcoming Events</h3>
                                <Link to="/events" className="news-events-link">More events</Link>                        
                                <div className="section-divider-bold"/>
                            </div>
                            <ShowLoadingQuery
                                query={eventsQuery}
                                defaultErrorTitle={"Error loading events list"}
                                thenRender={({events}) => {
                                    return <Row className="h-100">
                                        {events.map(event => <Col key={event.id}>
                                            <EventCard event={event} />
                                        </Col>)}
                                    </Row>;
                                }}/>
                        </div>
                        <div className="d-flex flex-column mt-3"> 
                            <div className="d-flex">
                                <h3>News & Features</h3>
                                <Link to="/news" className="news-events-link">More news</Link>                     
                                <div className="section-divider-bold"/>
                            </div>
                            {news && <Row className="h-100">
                                {news.slice(0, 2).map(newsItem => <Col key={newsItem.id}>
                                    <NewsCard newsItem={newsItem} />
                                </Col>)}
                            </Row>}
                        </div>
                    </Row>
                </section>
            </Container>
        </div>
    </>;
};
