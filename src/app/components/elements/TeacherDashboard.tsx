import React, { ChangeEvent, useRef, useState } from 'react';
import { selectors, useAppSelector, useGetGroupsQuery, useGetMySetAssignmentsQuery, useGetQuizAssignmentsSetByMeQuery } from '../../state';
import { Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { BookInfo, extractTeacherName, ISAAC_BOOKS, isDefined, Subject, useDeviceSize } from '../../services';
import { AssignmentDTO, IAssignmentLike, RegisteredUserDTO, UserSummaryDTO } from '../../../IsaacApiTypes';
import { GroupSelector } from '../pages/Groups';
import { StyledDropdown } from './inputs/DropdownInput';
import StyledToggle from './inputs/StyledToggle';
import { AssignmentCard, StudentDashboard } from './StudentDashboard';
import { orderBy } from 'lodash';
import { Spacer } from './Spacer';

const GroupsPanel = () => {
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const [showArchived, setShowArchived] = useState(false);
    const groupQuery = useGetGroupsQuery(showArchived);
    const { currentData: groups, isLoading, isFetching } = groupQuery;
    const otherGroups = useGetGroupsQuery(!showArchived);
    const allGroups = [...(groups ?? []) , ...(otherGroups.currentData ?? [])];
    const [selectedGroupId, setSelectedGroupId] = useState<number>();
    const selectedGroup = (isLoading || isFetching) ? undefined : groups?.find(g => g.id === selectedGroupId);
    const groupNameInputRef = useRef<HTMLInputElement>(null);
    
    return <div className="dashboard-panel scrollable-panel">
        <Link to="/groups" className="plain-link">
            <h4>Manage my groups</h4>
        </Link>
        <GroupSelector allGroups={allGroups} groupNameInputRef={groupNameInputRef} setSelectedGroupId={setSelectedGroupId} showArchived={showArchived}
            setShowArchived={setShowArchived} groups={groups} user={user} selectedGroup={selectedGroup} isDashboard={true} useHashAnchor={true} />
    </div>;
};

const AssignmentsPanel = () => {
    const getSortedAssignments = (assignments: AssignmentDTO[] | undefined) => {
        if (isDefined(assignments)) {
            return assignments.toSorted((a, b) => {
                if (a.dueDate && b.dueDate) {
                    return a.dueDate > b.dueDate ? 1 : -1;
                }
                return 0;
            });
        }
    };

    const assignmentsSetByMeQuery = useGetMySetAssignmentsQuery(undefined);
    const { data: assignmentsSetByMe } = assignmentsSetByMeQuery;
    const sortedAssignments = getSortedAssignments(assignmentsSetByMe);
    const upcomingAssignments = sortedAssignments?.filter(a => a.dueDate ? a.dueDate >= new Date() : false); // Filter out past assignments

    const quizzesSetByMeQuery = useGetQuizAssignmentsSetByMeQuery(undefined);
    const { data: quizzesSetByMe } = quizzesSetByMeQuery;

    const isOverdue = (assignment: IAssignmentLike) => {
        return assignment.dueDate && assignment.dueDate < new Date();
    };

    // Prioritise non-overdue quizzes, then sort as on My Tests
    const sortedQuizzes = orderBy(quizzesSetByMe, [
        (q) => isOverdue(q),
        (q) => q.dueDate,
        (q) => q.scheduledStartDate ?? q.creationDate,
        (q) => q.quiz?.title ?? ""
    ], ["asc", "asc", "asc", "asc"]);

    // Get the 3 most urgent due dates from assignments & quizzes combined
    // To avoid merging & re-sorting entire lists, get the 3 most urgent from each list first
    const soonestAssignments = upcomingAssignments?.slice(0, 3) ?? [];
    const soonestQuizzes = sortedQuizzes.slice(0, 3);

    const soonestDeadlines = orderBy([...soonestAssignments, ...soonestQuizzes], [
        (a) => a.dueDate,
        (a) => a.scheduledStartDate ?? a.creationDate
    ], ["asc", "asc", "asc"]).slice(0, 3);

    return <div className="dashboard-panel">
        <Link to="/assignment_schedule"  className="plain-link">
            <h4>Assignment schedule</h4>
        </Link>
        {soonestDeadlines.length ? soonestDeadlines.map(assignment => <AssignmentCard key={assignment.id} {...assignment}/>)
            : <div className="mt-3">You have no upcoming assignments.</div>}
        <Spacer/>
        <div className="d-flex align-items-center">
            <Link to="/assignment_schedule" className="d-inline panel-link">
                See all assignments
            </Link>
            <Link to="/set_tests" className="d-inline panel-link ms-5">
                See all tests
            </Link>
        </div>
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
    return <Card className="p-2 h-100">  
        <Link to={path} className="book">
            <img src={image} alt={title} className="w-100"/>
            <div className="mt-2">{title}</div>
        </Link>
    </Card>;
};

const BooksPanel = () => {
    const [subject, setSubject] = useState<Subject | "all">("all");
    return <div className="w-100 dashboard-panel">
        <Link to="/publications" className="plain-link">
            <h4>Books</h4>
        </Link>
        <div className="mb-3 w-50">
            <StyledDropdown value={subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value as Subject)}>
                <option value="all">All</option>
                <option value="physics">Physics</option>
                <option value="maths">Maths</option>
                <option value="chemistry">Chemistry</option>
                {/* No biology books */}
            </StyledDropdown>
        </div>
        <Row className="row-cols-3 row-cols-md-4 row-cols-lg-8 row-cols-xl-2 row-cols-xxl-3 flex-nowrap book-panel">
            {ISAAC_BOOKS.filter(book => book.subject === subject || subject === "all")
                .map((book) =>
                    <Col key={book.title} className="mb-2 me-1 p-0">
                        <BookCard {...book}/>
                    </Col>)}
        </Row>
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
