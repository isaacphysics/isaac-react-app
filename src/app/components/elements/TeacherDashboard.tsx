import React, { ChangeEvent, useState } from 'react';
import { selectors, useAppSelector, useGetGroupsQuery, useGetMySetAssignmentsQuery, useGetQuizAssignmentsSetByMeQuery } from '../../state';
import { Button, Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { BookInfo, extractTeacherName, ISAAC_BOOKS, sortUpcomingAssignments, Subject, useDeviceSize } from '../../services';
import { UserSummaryDTO } from '../../../IsaacApiTypes';
import { StyledDropdown } from './inputs/DropdownInput';
import StyledToggle from './inputs/StyledToggle';
import { AssignmentCard, StudentDashboard } from './StudentDashboard';
import sortBy from 'lodash/sortBy';
import { Spacer } from './Spacer';
import { ShowLoadingQuery } from '../handlers/ShowLoadingQuery';

const GroupsPanel = () => {
    const groupsQuery = useGetGroupsQuery(false);
    const { data: groups } = groupsQuery;
    const sortedGroups = sortBy(groups, g => g.created).reverse().slice(0, 5);

    return <div className="dashboard-panel">
        <h4>Manage my groups</h4>
        {sortedGroups.length ?
            <>
                <div className="overflow-hidden">
                    {sortedGroups.map(group => <Link key={group.id} to={`/groups#${group.id}`} className="d-block panel-my-isaac-link">{group.groupName}</Link>)}
                </div>
                <Spacer/>
                <Link to="/groups" className="d-inline panel-link mt-3">See all groups</Link>
            </>
            : <div className="text-center mt-lg-3">You have no active groups.<Button tag={Link} to="/groups" size="sm" className="mt-3">Create new group</Button></div>}
    </div>;
};

const AssignmentsPanel = () => {
    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);

    const quizzesSetByMeQuery = useGetQuizAssignmentsSetByMeQuery(undefined);
    const { data: quizzesSetByMe } = quizzesSetByMeQuery;
    const upcomingQuizAssignments = quizzesSetByMe?.filter(a => a.dueDate ? a.dueDate >= new Date() : false); // Filter out past quizzes
    const sortedQuizAssignments = upcomingQuizAssignments ? sortUpcomingAssignments(upcomingQuizAssignments) : [];

    return <div className="dashboard-panel">
        <h4>Assignment schedule</h4>

        <ShowLoadingQuery
            query={assignmentsSetByMeQuery}
            defaultErrorTitle={"Error fetching your assignments"}
            thenRender={(assignmentsSetByMe) => {
                const upcomingAssignments = assignmentsSetByMe?.filter(a => a.dueDate ? a.dueDate >= new Date() : false); // Filter out past assignments
                const sortedAssignments = upcomingAssignments ? sortUpcomingAssignments(upcomingAssignments) : [];

                // Get the 3 most urgent due dates from assignments & quizzes combined
                // To avoid merging & re-sorting entire lists, get the 3 most urgent from each list first
                const soonestAssignments = sortedAssignments?.slice(0, 3) ?? [];
                const soonestQuizzes = sortedQuizAssignments.slice(0, 3);
                const soonestDeadlines = sortUpcomingAssignments([...soonestAssignments, ...soonestQuizzes]).slice(0, 3);

                return <>
                    {soonestDeadlines.length ? soonestDeadlines.map(assignment => <div className="mb-3" key={assignment.id}><AssignmentCard {...assignment}/></div>)
                        : <div className="text-center mt-lg-3">You have no assignments with upcoming due dates.</div>}
                    <Spacer/>
                    <div className="d-flex align-items-center">
                        <Link to="/assignment_schedule" className="d-inline text-center panel-link me-3">
                            See all assignments
                        </Link>
                        <Link to="/set_tests" className="d-inline text-center panel-link ms-auto">
                            See all tests
                        </Link>
                    </div>
                </>;
            }
            }/>
    </div>;
};

const MyIsaacPanel = () => {
    return <div className='dashboard-panel'>
        <h4>More in My Isaac</h4>
        <div className="d-flex flex-column">
            <div className="col">
                <Link to="/teacher_features" className='d-block panel-my-isaac-link'>
                    Teacher features
                </Link>
                <Link to="/groups" className='d-block panel-my-isaac-link'>
                    Manage groups
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
                <Link to="/set_tests" className='d-block panel-my-isaac-link'>
                    Set / manage tests
                </Link>
            </div>
        </div>
        <div className="section-divider" />
        <Link to="/account" className="panel-my-isaac-link">
            My account
        </Link>
    </div>;
};

const BookCard = ({title, image, path}: BookInfo) => {
    return <Card className="p-2 h-100 border-0 bg-transparent">  
        <Link to={path} className="d-flex flex-column align-items-center dashboard-book book-container">
            <div className="book-image-container">
                <img src={image} alt={title}/>
            </div>
            <div className="mt-2">{title}</div>
        </Link>
    </Card>;
};

const BooksPanel = () => {
    const [subject, setSubject] = useState<Subject | "all">("all");
    return <div className="w-100 dashboard-panel book-panel">
        <div className="d-flex align-items-center">
            <h4>Books</h4>
            <div className="w-50 ms-auto">
                <StyledDropdown value={subject}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value as Subject)}>
                    <option value="all">All</option>
                    <option value="physics">Physics</option>
                    <option value="maths">Maths</option>
                    <option value="chemistry">Chemistry</option>
                    {/* No biology books */}
                </StyledDropdown>
            </div>
        </div>
        <Row className="mt-sm-3 mt-md-0 mt-xl-3 row-cols-3 row-cols-md-4 row-cols-lg-8 row-cols-xl-2 row-cols-xxl-auto flex-nowrap overflow-x-scroll overflow-y-hidden">
            {ISAAC_BOOKS.filter(book => book.subject === subject || subject === "all")
                .map((book) =>
                    <Col key={book.title} className="mb-2 me-1 p-0">
                        <BookCard {...book}/>
                    </Col>)}
        </Row>
        <Spacer/>
        <Link to="/publications" className="d-inline panel-link">See all books</Link>
    </div>;
};

export const TeacherDashboard = () => {
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = extractTeacherName(user as UserSummaryDTO);
    const [studentView, setStudentView] = useState(false);
             
    return <div className="dashboard dashboard-outer w-100">
        <div className="d-flex">
            {nameToDisplay && <span className="welcome-text">Welcome back, {nameToDisplay}!</span>}
            <span className="ms-auto">
                <div className="text-center">Dashboard view</div>
                <StyledToggle
                    checked={studentView}
                    falseLabel="Teacher"
                    trueLabel="Student"
                    onChange={() => setStudentView(studentView => !studentView)}             
                />
            </span>
        </div>
        {studentView ? <StudentDashboard/> :
            <>{deviceSize === "lg"
                ? <>
                    <Row className="row-cols-3">
                        <Col className="mt-4 col-4">
                            <GroupsPanel />
                        </Col>
                        <Col className="mt-4 col-5">
                            <AssignmentsPanel />
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
                            <GroupsPanel />
                        </Col>
                        <Col className="mt-4">
                            <AssignmentsPanel />
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
