import React, { useEffect, useRef, useState } from 'react';
import { getMyProgress, openActiveModal, selectors, showErrorToast, useAppDispatch, useAppSelector, useGetMyAssignmentsQuery, useGetQuizAssignmentsAssignedToMeQuery, useLazyGetTokenOwnerQuery } from '../../state';
import { DashboardStreakGauge } from './views/StreakGauge';
import { Button, Card, Col, Input, InputGroup, Row, UncontrolledTooltip } from 'reactstrap';
import { Link } from 'react-router-dom';
import { filterAssignmentsByStatus, isDefined, isLoggedIn, isTeacherOrAbove, PATHS, useDeviceSize } from '../../services';
import { tokenVerificationModal } from './modals/TeacherConnectionModalCreators';
import { AssignmentDTO, IAssignmentLike, QuizAssignmentDTO } from '../../../IsaacApiTypes';
import { useAssignmentsCount } from '../navigation/NavigationBar';
import { ShowLoadingQuery } from '../handlers/ShowLoadingQuery';
import { Spacer } from './Spacer';
import classNames from 'classnames';
import { orderBy } from 'lodash';

const GroupJoinPanel = () => {
    const user = useAppSelector(selectors.user.orNull);
    const dispatch = useAppDispatch();
    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const [authenticationToken, setAuthenticationToken] = useState<string | null>();

    const authenticateWithTokenAfterPrompt = async (userId: number, token: string | null) => {
        if (!token) {
            dispatch(showErrorToast("No group code provided", "You have to enter a group code!"));
            return;
        }
        else {
            const {data: usersToGrantAccess} = await getTokenOwner(token);
            if (usersToGrantAccess && usersToGrantAccess.length) {
                dispatch(openActiveModal(tokenVerificationModal(userId, token, usersToGrantAccess)) as any);
            }
        }
    };

    function processToken(event: React.FormEvent<HTMLFormElement | HTMLButtonElement | HTMLInputElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (user && user.loggedIn && user.id && isDefined(authenticationToken)) {
            authenticateWithTokenAfterPrompt(user.id, authenticationToken);
        }
    }

    return <div className='w-100 dashboard-panel'>
        <h4>Join a group</h4>
        Enter the code given by your teacher to create a teacher connection and join a group.
        <InputGroup className="my-4 separate-input-group">
            <Input
                type="text" placeholder="Enter code"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                onKeyDown={(e) => {if (e.key === 'Enter') {
                    e.preventDefault();
                }}}
            />
            <Button onClick={processToken} outline color="secondary">
                Connect
            </Button>
        </InputGroup>
        <Spacer/>
        <Link to="/account#teacherconnections" className="panel-link">
            See my existing groups
        </Link>
    </div>;
};

const DashboardStreakPanel = () => {
    const dispatch = useAppDispatch();
    const myProgress = useAppSelector(selectors.user.progress);

    useEffect(() => {
        dispatch(getMyProgress());
    }, [dispatch]);

    const streaksTooltip = useRef(null);
    const tooltip = <UncontrolledTooltip placement="auto" autohide={false} target={streaksTooltip}>
            The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/><br/>
            Answer at least ten question parts correctly per week to fill up your weekly progress bar and increase your streak!
    </UncontrolledTooltip>;

    const remainingToAnswer = 10 - (myProgress?.userSnapshot?.weeklyStreakRecord?.currentActivity || 0);

    return <div className='w-100 dashboard-panel'>
        <h4>Build your weekly streak</h4>
        <div className={"streak-panel-gauge align-self-center text-center mb-3"}>
            <DashboardStreakGauge streakRecord={myProgress?.userSnapshot}/>
        </div>
        {remainingToAnswer === 0 ? <div className="streak-text">You&apos;ve maintained your streak for this week!</div> : <div className="streak-text">Only {remainingToAnswer} more question parts to answer correctly this week!</div>}
        <Spacer/>
        <Button className="numeric-help d-flex align-items-center p-0 gap-2 panel-link mt-2" color="link" size="sm" innerRef={streaksTooltip}>
            <i className="icon icon-info icon-color-grey"/> What is this?
        </Button>
        {tooltip}
    </div>;
};

const AssignmentCard = (assignment: IAssignmentLike) => {
    const today = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
    const isOverdue = dueDate && dueDate < today;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) : undefined; // 1000*60*60*24

    function isQuiz(assignment: IAssignmentLike): assignment is QuizAssignmentDTO {
        return (assignment as QuizAssignmentDTO).quizId !== undefined;
    }

    function isAssignment(assignment: IAssignmentLike): assignment is AssignmentDTO {
        return (assignment as AssignmentDTO).gameboardId !== undefined;
    }

    const link = isQuiz(assignment) ? `/test/assignment/${assignment.id}`
        : isAssignment(assignment) ? `${PATHS.GAMEBOARD}#${assignment.gameboardId}`
            : "";

    const title = isQuiz(assignment) ? assignment.quizSummary?.title
        : isAssignment(assignment) ? assignment.gameboard?.title
            : "";

    return <Link to={link} className="mt-3">
        <Card className="assignment-card px-3">
            <div className="d-flex flex-row h-100">
                <i className="icon icon-question-pack" />
                <div className="flex-grow-1 ms-2">
                    <h5>{title}</h5>
                </div>
                {dueDate && (isOverdue ? <span className="align-self-end overdue">Overdue</span> : <span className="align-self-end">Due in {daysUntilDue} day{daysUntilDue !== 1 && "s"}</span>)}
            </div>
        </Card>
    </Link>;
};

const CurrentWorkPanel = () => {
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const {data: quizAssignments} = useGetQuizAssignmentsAssignedToMeQuery();

    const isOverdue = (assignment: IAssignmentLike) => {
        return assignment.dueDate && assignment.dueDate < new Date();
    };

    // Prioritise non-overdue quizzes, then sort as on My Tests
    const sortedQuizzes = orderBy(quizAssignments, [
        (q) => isOverdue(q),
        (q) => q.dueDate,
        (q) => q.scheduledStartDate ?? q.creationDate,
        (q) => q.quiz?.title ?? ""
    ], ["asc", "asc", "asc", "asc"]);

    return <div className='w-100 dashboard-panel'>
        <h4>Complete current work</h4>
        <ShowLoadingQuery
            query={assignmentQuery}
            defaultErrorTitle={"Error fetching your assignments"}
            thenRender={(assignments) => {
                const myAssignments = filterAssignmentsByStatus(assignments);

                // Get the 2 most urgent due dates from assignments & quizzes combined
                // To avoid merging & re-sorting entire lists, get the 2 most urgent from each list first
                const assignmentsToDo = [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld].slice(0, 2);
                const quizzesToDo = sortedQuizzes.slice(0, 2);

                const toDo = orderBy([...assignmentsToDo, ...quizzesToDo], [
                    (a) => isOverdue(a),
                    (a) => a.dueDate,
                    (a) => a.scheduledStartDate ?? a.creationDate
                ], ["asc", "asc", "asc"]).slice(0, 2);

                return <>
                    {toDo.length === 0 ?
                        <div className="mt-3">You have no active assignments.</div> :
                        <>
                            <span>You have assignments that are active or due soon:</span>
                            {toDo.map((assignment: IAssignmentLike) => <AssignmentCard key={assignment.id} {...assignment} />)}
                        </>}
                </>;
            }
            }/>
    </div>;
};

const MyIsaacPanel = () => {
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();
    return <div className='w-100 dashboard-panel'>
        <h4>More in My Isaac</h4>
        <div className="d-flex flex-column">
            <Link to="/my_gameboards" className="panel-my-isaac-link">
                My question packs
            </Link>
            <Link to="/assignments" className="panel-my-isaac-link">
                My assignments
                {assignmentsCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{assignmentsCount > 99 ? "99+" : assignmentsCount}</span>}
            </Link>
            <Link to="/progress" className="panel-my-isaac-link">
                My progress
            </Link>
            <Link to="/tests" className="panel-my-isaac-link">
                My tests
                {quizzesCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{quizzesCount > 99 ? "99+" : quizzesCount}</span>}
            </Link>
            <div className="section-divider"/>
            <Link to="/account" className="panel-my-isaac-link">
                My account
            </Link>
        </div>
    </div>; 
};

export const StudentDashboard = () => {
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = isLoggedIn(user) && !isTeacherOrAbove(user) && user.givenName;

    return <div className={classNames("dashboard w-100", {"dashboard-outer": !isTeacherOrAbove(user)})}>
        {nameToDisplay && <span className="welcome-text">Welcome back, {nameToDisplay}!</span>}
        {deviceSize === "lg"
            ? <>
                <Row>
                    <Col className="mt-4">
                        <CurrentWorkPanel />
                    </Col>
                </Row>
                <Row className="row-cols-3">
                    <Col className="mt-4 panel-streak">
                        <DashboardStreakPanel />
                    </Col>
                    <Col className="mt-4">
                        <GroupJoinPanel />
                    </Col>
                    <Col className="mt-4">
                        <MyIsaacPanel />
                    </Col>
                </Row></>
            : <>
                <Row className="row-cols-1 row-cols-sm-2 row-cols-xl-4">
                    <Col className="mt-4 col-xl-3">
                        <CurrentWorkPanel />
                    </Col>
                    <Col className="mt-4 col-xl-2 panel-streak">
                        <DashboardStreakPanel />
                    </Col>
                    <Col className="mt-4 col-sm-7 col-xl-4">
                        <GroupJoinPanel />
                    </Col>
                    <Col className="mt-4 col-sm-5 col-xl-3">
                        <MyIsaacPanel />
                    </Col>
                </Row></>
        }
    </div>;
};
