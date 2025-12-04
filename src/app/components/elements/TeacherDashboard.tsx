import React, { ChangeEvent, useState } from 'react';
import { selectors, useAppSelector } from '../../state';
import { Button, Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { BookInfo, extractTeacherName, ISAAC_BOOKS, isOverdue, isTutor, sortUpcomingAssignments, Subject, useDeviceSize } from '../../services';
import { AssignmentDTO, QuizAssignmentDTO, UserSummaryDTO } from '../../../IsaacApiTypes';
import StyledToggle from './inputs/StyledToggle';
import { AssignmentCard, StudentDashboard } from './StudentDashboard';
import sortBy from 'lodash/sortBy';
import { Spacer } from './Spacer';
import { AppGroup, UserSnapshot } from '../../../IsaacAppTypes';
import { useStatefulElementRef } from './markup/portals/utils';
import { ScrollShadows } from './ScrollShadows';
import { ShowLoading } from '../handlers/ShowLoading';

interface GroupsPanelProps {
    groups: AppGroup[] | undefined;
}

const GroupsPanel = ({ groups }: GroupsPanelProps) => {
    const sortedGroups = sortBy(groups, g => g.created).reverse().slice(0, 5);

    return <div className="dashboard-panel">
        <h4>View group progress</h4>
        {sortedGroups.length ?
            <>
                <div>
                    {sortedGroups.map(group => <Link key={group.id} to={`/assignment_progress/group/${group.id}`} className="d-block panel-my-isaac-link">{group.groupName}</Link>)}
                </div>
                <Spacer/>
                <Link to="/assignment_progress" className="d-inline panel-link mt-3">See all groups&apos; progress</Link>
            </> :
            <>
                <div className="text-center mt-lg-3">You have no active groups.</div>
                <div className="text-center"><Button tag={Link} to="/groups" size="sm" className="mt-3">Create new group</Button></div>
            </>}
    </div>;
};

interface AssignmentsPanelProps {
    assignments: AssignmentDTO[] | undefined;
    quizzes: QuizAssignmentDTO[] | undefined;
    groups: AppGroup[] | undefined;
};

const AssignmentsPanel = ({ assignments, quizzes, groups }: AssignmentsPanelProps) => {
    const user = useAppSelector(selectors.user.orNull);
    
    const upcomingAssignments = assignments?.filter(a => a.dueDate && !isOverdue(a) ); // Filter out past assignments
    const sortedAssignments = upcomingAssignments ? sortUpcomingAssignments(upcomingAssignments) : [];

    const upcomingQuizAssignments = quizzes?.filter(a => a.dueDate && !isOverdue(a)); // Filter out past quizzes
    const sortedQuizAssignments = upcomingQuizAssignments ? sortUpcomingAssignments(upcomingQuizAssignments) : [];

    // Get the 3 most urgent due dates from assignments & quizzes combined
    // To avoid merging & re-sorting entire lists, get the 3 most urgent from each list first
    const soonestAssignments = sortedAssignments.slice(0, 3);
    const soonestQuizzes = sortedQuizAssignments.slice(0, 3);
    const soonestDeadlines = sortUpcomingAssignments([...soonestAssignments, ...soonestQuizzes]).slice(0, 3);

    return <div className="dashboard-panel">
        <h4>View scheduled work</h4>
        <ShowLoading
            until={assignments && quizzes}
            thenRender={() => {
                return soonestDeadlines.length 
                    ? <div className="overflow-y-auto px-1 pt-1 mx-n1 mt-m1 mb-2">
                        {soonestDeadlines.map((assignment, i) => 
                            <div className={i+1 < soonestDeadlines.length ? "mb-3" : "mb-1"} key={assignment.id}>
                                <AssignmentCard assignment={assignment} isTeacherDashboard groups={groups} />
                            </div>)}
                    </div>
                    : <div className="text-center mt-lg-3">You have no assignments with upcoming due dates.</div>;
            }}
        />
        <Spacer/>
        <div className="d-flex align-items-center">
            <Link to="/assignment_schedule" className="d-inline text-center panel-link me-3">
                See assignment schedule
            </Link>
            {!isTutor(user) && <Link to="/set_tests#manage" className="d-inline text-center panel-link ms-auto">
                See all set tests
            </Link>}
        </div>
    </div>;
};

const MyIsaacPanel = () => {
    const user = useAppSelector(selectors.user.orNull);
    return <div className='dashboard-panel'>
        <h4>More in My Isaac</h4>
        <div className="d-flex flex-column">
            <div className="col">
                {isTutor(user) 
                    ? <Link to="/tutor_features" className='d-block panel-my-isaac-link'>
                        Tutor features
                    </Link>
                    : <Link to="/teacher_features" className='d-block panel-my-isaac-link'>
                        Teacher features
                    </Link>}
                <Link to="/groups" className='d-block panel-my-isaac-link'>
                    Manage groups
                </Link>
                <Link to="/question_deck_builder" className='d-block panel-my-isaac-link'>
                    Create a question deck
                </Link>
                <Link to="/set_assignments" className='d-block panel-my-isaac-link'>
                    Set assignments
                </Link>
                <Link to="/assignment_schedule" className='d-block panel-my-isaac-link'>
                    Assignment schedule
                </Link>
                <Link to="/assignment_progress" className='d-block panel-my-isaac-link'>
                    Assignment progress
                </Link>
                {!isTutor(user) &&
                    <Link to="/set_tests" className='d-block panel-my-isaac-link'>
                        Set / manage tests
                    </Link>}
            </div>
        </div>
        <div className="section-divider" />
        <Link to="/account" className="panel-my-isaac-link">
            My account
        </Link>
    </div>;
};

export const BookCardSmall = ({title, image, path}: BookInfo) => {
    return <Card className="p-2 h-100 border-0 bg-transparent">  
        <Link to={path} className="d-flex flex-column align-items-center dashboard-book book-container">
            <div className="book-image-container">
                <img src={image} alt={title}/>
            </div>
            <div className="mt-2 text-center">{title}</div>
        </Link>
    </Card>;
};

const BooksPanel = () => {
    const [subject, setSubject] = useState<Subject | "all">("all");
    const [scrollRef, setScrollRef] = useStatefulElementRef<HTMLElement>();

    return <div className="w-100 dashboard-panel book-panel">
        <div className="d-flex align-items-center">
            <h4>Explore our books</h4>
            <Spacer/>
            <select className="books-select ms-2 mb-3" value={subject}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value as Subject)}>
                <option value="all">All</option>
                <option value="physics">Physics</option>
                <option value="maths">Maths</option>
                <option value="chemistry">Chemistry</option>
                {/* No biology books */}
            </select>
        </div>
        <div ref={setScrollRef} className="row position-relative mt-sm-3 mt-md-0 mt-xl-3 row-cols-3 row-cols-md-4 row-cols-lg-8 row-cols-xl-2 row-cols-xxl-auto flex-nowrap overflow-x-scroll overflow-y-hidden">
            {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
            {window.ResizeObserver && <ScrollShadows element={scrollRef ?? undefined} shadowType="dashboard-scroll-shadow" />}
            {ISAAC_BOOKS.filter(b => !b.hidden).filter(book => book.subject === subject || subject === "all")
                .map((book) =>
                    <Col key={book.title} className="mb-2 me-1 p-0">
                        <BookCardSmall {...book}/>
                    </Col>)}
        </div>
        <Spacer/>
        <Link to="/books" className="d-inline panel-link">See all books</Link>
    </div>;
};

interface TeacherDashboardProps {
    assignmentsSetByMe: AssignmentDTO[] | undefined;
    quizzesSetByMe: QuizAssignmentDTO[] | undefined;
    myAssignments: AssignmentDTO[] | undefined;
    myQuizAssignments: QuizAssignmentDTO[] | undefined;
    groups: AppGroup[] | undefined;
    streakRecord: UserSnapshot | undefined;
    dashboardView: "teacher" | "student" | undefined; // this is always defined if we are displaying a dashboard; just here for typing
    setDashboardView: React.Dispatch<React.SetStateAction<"teacher" | "student" | undefined>>;
}

export const TeacherDashboard = ({ assignmentsSetByMe, quizzesSetByMe, myAssignments, myQuizAssignments, groups, streakRecord, dashboardView, setDashboardView }: TeacherDashboardProps) => {
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = extractTeacherName(user as UserSummaryDTO);
             
    return <div className="dashboard dashboard-outer w-100">
        <div className="d-flex flex-wrap">
            {nameToDisplay && <h3 className="text-wrap">Welcome back, {nameToDisplay}!</h3>}
            <span className="ms-auto">
                <div className="text-center">Dashboard view</div>
                <StyledToggle
                    checked={dashboardView === "student"}
                    falseLabel={isTutor(user) ? "Tutor" : "Teacher"}
                    trueLabel="Student"
                    onChange={() => setDashboardView(studentView => studentView === "teacher" ? "student" : "teacher")}             
                />
            </span>
        </div>
        {dashboardView === "student" ? <StudentDashboard assignments={myAssignments} quizAssignments={myQuizAssignments} streakRecord={streakRecord} groups={groups} /> :
            <>{deviceSize === "lg"
                ? <>
                    <Row className="row-cols-3">
                        <Col className="mt-4 col-4">
                            <GroupsPanel groups={groups} />
                        </Col>
                        <Col className="mt-4 col-5">
                            <AssignmentsPanel assignments={assignmentsSetByMe} quizzes={quizzesSetByMe} groups={groups} />
                        </Col>
                        <Col className="mt-4 col-3">
                            <MyIsaacPanel />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="mt-4">
                            <BooksPanel />
                        </Col>
                    </Row></>
                : <>
                    <Row className="row-cols-1 row-cols-sm-2 row-cols-xl-4">
                        <Col className="mt-4">
                            <GroupsPanel groups={groups} />
                        </Col>
                        <Col className="mt-4">
                            <AssignmentsPanel assignments={assignmentsSetByMe} quizzes={quizzesSetByMe} groups={groups} />
                        </Col>
                        <Col className="mt-4 col-sm-7 col-xl-3">
                            <BooksPanel />
                        </Col>
                        <Col className="mt-4 col-sm-5 col-xl-3">
                            <MyIsaacPanel />
                        </Col>
                    </Row>
                </>}
            </>
        }
    </div>;
};
