import React, {useEffect, useState} from "react";
import {selectors, useAppSelector, useGetNewsPodListQuery, useLazyGetEventsQuery, useLazyGetGroupsQuery, useLazyGetMyAssignmentsQuery, useLazyGetMySetAssignmentsQuery, useLazyGetQuizAssignmentsAssignedToMeQuery, useLazyGetQuizAssignmentsSetByMeQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardProps, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {above, EventStatusFilter, EventTypeFilter, HUMAN_STAGES, HUMAN_SUBJECTS, isDefined, isLoggedIn, isTutor, isTutorOrAbove, PHY_NAV_SUBJECTS, SITE_TITLE, STAGE, Subject, useDeviceSize} from "../../../services";
import { NewsCard } from "../../elements/cards/NewsCard";
import { ShowLoadingQuery } from "../../handlers/ShowLoadingQuery";
import { EventCard } from "../../elements/cards/EventCard";
import { StudentDashboard } from "../../elements/StudentDashboard";
import { ListViewCardProps, ListViewCards } from "../../elements/list-groups/ListView";
import { Spacer } from "../../elements/Spacer";
import { TeacherDashboard } from "../../elements/TeacherDashboard";

interface HomepageHeroCardProps extends CardProps {
    title?: string;
    content?: string;
    isStudent?: boolean;
}

const HomepageHeroCard = ({title, content, isStudent}: HomepageHeroCardProps) => {
    return <Card className="homepage-hero-card border-0">
        <CardBody className="p-4 pt-7 d-flex flex-column">
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
            <Container className="pt-7">
                <div className="w-100 w-md-50 mb-4 mb-md-7 mb-xl-9 pe-xl-7">
                    <div className="physics-strapline mb-3">
                        <h2><span className="text-green">Master Science subjects</span> by solving problems</h2>
                    </div>
                    From School to University – <b>Isaac</b> is a free platform for teachers and students for use in the classroom, for homework and for revision.
                </div>
                {!above['md'](deviceSize) && <div className="homepage-hero-img container-override"/>}
                <Row className="row-cols-1 row-cols-md-2">
                    <Col className="mb-3">
                        <HomepageHeroCard
                            title="Build confidence in science through practice"
                            content="Tackle interactive questions, explore varying difficulty levels, and strengthen problem-solving skills with concept guides, video lessons, and events."
                            isStudent={true}/>
                    </Col>
                    <Col className="mb-3">
                        <HomepageHeroCard
                            title="Support students in developing skills and achieving higher results"
                            content="Assign, track, and manage student progress with ease—ideal for classwork, homework, or revision. Trusted by more than 3,500 teachers."
                            isStudent={false}/>
                    </Col>
                </Row>
            </Container>
        </div>;
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

const subjectDescriptions: Record<Subject, string> = {
    "physics": "Discover how the universe works using our question decks, quizzes, lessons and revision, and much more.  Click on a learning stage below to explore!",
    "maths": "Unlock the language of science using our question decks, apps, and much more.  Click on a learning stage below to explore!",
    "chemistry": "Grasp the fundamentals of matter using our question decks, glossary, apps, and much more. Click on a learning stage below to explore!",
    "biology": "Uncover the the science of life using our question decks, glossary, extension materials, and much more. Click on the learning stage below to explore!",
};

const getListViewSubjectCard = (sc: subjectCategory) => {

    const listViewSubjectCard: ListViewCardProps = {
        title: sc.humanSubject,
        subtitle: subjectDescriptions[sc.subject as Subject],
        icon: {
            type: "img", 
            icon: `/assets/phy/icons/redesign/subject-${sc.subject}.svg`,
            width: "70px",
            height: "81px",
        },
        subject: sc.subject as Subject,
        linkTags: sc.subcategories.map((subcat) => ({tag: subcat.humanStage, url: subcat.href, "aria-label": `Explore ${subcat.humanStage} ${sc.humanSubject}`})),
    };

    return listViewSubjectCard;
};

const AdaSubjectCard: ListViewCardProps = {
    title: "Studying computer science?",
    subtitle: "Check out Ada CS, our partner platform. It’s free and packed with resources for computer science teachers and students.",
    icon: {
        type: "img", 
        icon: "/assets/common/logos/ada_logo_stamp_aqua.svg",
        width: "70px",
        height: "81px",
    },
    linkTags: [{tag: "Find out more", url: "", "aria-label": "Find out about Ada Computer Science"}]
};

const cards = [...subjectCategories.map((sc) => getListViewSubjectCard(sc)), AdaSubjectCard];

export const HomepagePhy = () => {

    useEffect( () => {document.title = SITE_TITLE;}, []);

    const user = useAppSelector(selectors.user.orNull);
    
    const newsQuery = useGetNewsPodListQuery({subject: "physics"});

    const [dashboardView, setDashboardView] = useState<"student" | "teacher" | undefined>(undefined);

    // all dashboard queries should be lazy as they may not run depending on dashboard view
    // this also prevents mass-loading queries on page load
    const [getAssignmentsSetByMe, {data: assignmentsSetByMe}] = useLazyGetMySetAssignmentsQuery();
    const [getQuizzesSetByMe, {data: quizzesSetByMe}] = useLazyGetQuizAssignmentsSetByMeQuery();
    const [getGroups, {data: groups}] = useLazyGetGroupsQuery();

    //{refetchOnMountOrArgChange: true, refetchOnReconnect: true}
    const [getMyAssignments, {data: myAssignments}] = useLazyGetMyAssignmentsQuery();
    const [getMyQuizAssignments, {data: myQuizAssignments}] = useLazyGetQuizAssignmentsAssignedToMeQuery();

    useEffect(() => {
        if (isLoggedIn(user)) {
            setDashboardView(isTutorOrAbove(user) ? "teacher" : "student");
        }
    }, [user]);

    useEffect(() => {
        if (dashboardView === "teacher" && (!isDefined(assignmentsSetByMe) || !isDefined(quizzesSetByMe) || !isDefined(groups))) {
            getAssignmentsSetByMe(undefined);
            getGroups(false);
            if (!isTutor(user)) {
                getQuizzesSetByMe(undefined);
            }
        } else if (dashboardView === "student" && (!isDefined(myAssignments) || !isDefined(myQuizAssignments))) {
            getMyAssignments(undefined);
            getMyQuizAssignments(undefined);
        }
    }, [dashboardView]);

    const streakRecord = useAppSelector(selectors.user.snapshot);

    const [getEventsList, eventsQuery] = useLazyGetEventsQuery();
    useEffect(() => {
        getEventsList({startIndex: 0, limit: 2, typeFilter: EventTypeFilter["All groups"], statusFilter: EventStatusFilter["Upcoming events"], stageFilter: [STAGE.ALL]});
    }, []);

    return <>
        <div id="homepage" className="homepage pb-7">
            <section id="dashboard">
                {isLoggedIn(user) && (isTutorOrAbove(user)
                    ? <TeacherDashboard assignmentsSetByMe={assignmentsSetByMe} quizzesSetByMe={isTutor(user) ? [] : quizzesSetByMe} groups={groups} myAssignments={myAssignments}
                        myQuizAssignments={myQuizAssignments} streakRecord={streakRecord} dashboardView={dashboardView} setDashboardView={setDashboardView} />
                    : <StudentDashboard assignments={myAssignments} quizAssignments={myQuizAssignments} streakRecord={streakRecord} groups={groups} />)}
            </section>
            <section id="homepage-hero">
                {!isLoggedIn(user) && <HomepageHero />}
            </section>
            <Container>
                <section id="explore-learn">
                    <div className="mt-7">
                        <div className="d-flex">
                            <h3>Explore and learn!</h3>
                            <div className="section-divider flex-grow-1 ms-2"/>
                        </div>
                        <ListViewCards cards={cards} centreLast/>
                    </div>
                </section>
                <section id="events-news">
                    <Row className="mt-7 row-cols-1 row-cols-lg-2">
                        <div className="d-flex flex-column mt-3">
                            <div className="d-flex">
                                <h3>Upcoming events</h3>
                                <Link to="/events" className="news-events-link">More events</Link>
                                <div className="section-divider-bold flex-grow-1"/>
                            </div>
                            <ShowLoadingQuery
                                query={eventsQuery}
                                ifError={(() => <p>There was an error loading the events list. Please try again later!</p>)}
                                thenRender={({events}) => {
                                    return <Row className="h-100">
                                        {events.length
                                            ? events.map(event => <Col key={event.id}>
                                                <EventCard event={event} />
                                            </Col>)
                                            : <p>No events available. Check back soon!</p>}

                                    </Row>;
                                }}/>
                        </div>
                        <div className="d-flex flex-column mt-3">
                            <div className="d-flex">
                                <h3>News and features</h3>
                                <Link to="/news" className="news-events-link">More news</Link>
                                <div className="section-divider-bold flex-grow-1"/>
                            </div>
                            <ShowLoadingQuery
                                query={newsQuery}
                                ifError={(() => <p>There was an error loading the news list. Please try again later!</p>)}
                                thenRender={(news) => {
                                    return <Row className="h-100">
                                        {news.length
                                            ? news.slice(0, 2).map(newsItem => <Col key={newsItem.id}>
                                                <NewsCard newsItem={newsItem} />
                                            </Col>)
                                            : <p>No news available. Check back soon!</p>
                                        }
                                    </Row>;
                                }}
                            />
                        </div>
                    </Row>
                </section>
            </Container>
        </div>
    </>;
};
