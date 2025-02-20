import React, { ChangeEvent, useRef, useState } from 'react';
import { selectors, useAppSelector, useGetGroupsQuery, useGetMySetAssignmentsQuery, useGetSingleSetAssignmentQuery } from '../../state';
import { skipToken } from '@reduxjs/toolkit/query';
import { Button, Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { above, isDefined, isLoggedIn, isTutorOrAbove, Subject, TAG_ID, tags, useDeviceSize } from '../../services';
import { BookInfo, isaacBooks } from './modals/IsaacBooksModal';
import { AssignmentDTO, RegisteredUserDTO } from '../../../IsaacApiTypes';
import { GroupSelector } from '../pages/Groups';
import { StyledDropdown } from './inputs/DropdownInput';

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
            setShowArchived={setShowArchived} groups={groups} user={user} selectedGroup={selectedGroup} showCreateGroup={false} />
    </div>;
};

interface AssignmentCardProps {
    assignmentId?: number;
    groupName?: string; // In props because useSingleSetAssignmentQuery doesn't return group name
}

const AssignmentCard = ({assignmentId, groupName}: AssignmentCardProps) => {
    const deviceSize = useDeviceSize();

    // Query single assignment for each card because useGetMySetAssignmentsQuery doesn't return gameboard info
    const assignmentQuery = useGetSingleSetAssignmentQuery(assignmentId || skipToken);
    const { data: assignment } = assignmentQuery;
    const gameboard = assignment?.gameboard;

    const [showMore, setShowMore] = useState(false);

    const topics = tags.getTopicTags(Array.from((gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();

    if (isDefined(assignment)) {
        return <Link to={`/assignment_progress/${assignmentId}`} className="plain-link">
            <Card key={assignmentId} className="p-3 my-2 w-100 assignment-card">
                <Row>
                    <i className="icon icon-question-pack" />
                    <Col>
                        <div>
                            <h5>{gameboard?.title ?? ""}</h5>
                        </div>
                        <div>
                            Assigned to <b>{groupName}</b>
                        </div>
                        <div>
                            {assignment.dueDate && <>Due <b>{new Date(assignment.dueDate).toLocaleDateString()}</b></>}
                        </div>
                        {above['md'](deviceSize) && <Button className="my-2 btn-underline" style={{fontSize: "14px"}} color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                            {showMore ? "Hide details" : "Show details"}
                        </Button>}
                        {showMore && <div>
                            <p className="mb-0"><strong>Questions:</strong> {gameboard?.contents?.length || "0"}</p>
                            {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                                <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                                {topics.join(", ")}
                            </p>}
                        </div>}
                    </Col>
                </Row>
            </Card>
        </Link>;
    }
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

    return <div className="dashboard-panel scrollable-panel">
        <Link to="/assignment_schedule"  className="plain-link">
            <h4>Assignment schedule</h4>
        </Link>
        {upcomingAssignments && upcomingAssignments.map(({id, groupName}) => <AssignmentCard key={id} assignmentId={id} groupName={groupName} />)}
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
                <option value="all">All subjects</option>
                <option value="physics">Physics</option>
                <option value="maths">Maths</option>
                <option value="chemistry">Chemistry</option>
                {/* No biology books */}
            </StyledDropdown>
        </div>
        <Row className="row-cols-3 row-cols-md-4 row-cols-lg-8 row-cols-xl-2 row-cols-xxl-3 flex-nowrap book-panel">
            {isaacBooks.filter(book => book.subject === subject || subject === "all")
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
    if (user && isLoggedIn(user) && isTutorOrAbove(user)) {
        return <div className="dashboard w-100">
            {deviceSize === "lg"
                ? <>
                    <Row className="row-cols-3">
                        <Col className="mt-4">
                            <GroupsPanel />
                        </Col>
                        <Col className="mt-4 panel-streak">
                            <AssignmentsPanel />
                        </Col>
                        <Col className="mt-4">
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
        </div>;
    }
};
