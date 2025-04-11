import React, { useMemo, useRef, useState } from 'react';
import { openActiveModal, selectors, showErrorToast, useAppDispatch, useAppSelector, useLazyGetTokenOwnerQuery } from '../../state';
import { DashboardStreakGauge } from './views/StreakGauge';
import { Button, Card, Col, Input, InputGroup, Row, UncontrolledTooltip } from 'reactstrap';
import { Link } from 'react-router-dom';
import { convertAssignmentToQuiz, filterAssignmentsByStatus, isAssignment, isDefined, isLoggedIn, isOverdue, isQuiz, isTutorOrAbove, PATHS, QuizStatus, sortUpcomingAssignments, useDeviceSize } from '../../services';
import { tokenVerificationModal } from './modals/TeacherConnectionModalCreators';
import { AssignmentDTO, IAssignmentLike, QuizAssignmentDTO } from '../../../IsaacApiTypes';
import { getActiveWorkCount } from '../navigation/NavigationBar';
import { Spacer } from './Spacer';
import classNames from 'classnames';
import { AppGroup, UserSnapshot } from '../../../IsaacAppTypes';

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
                dispatch(openActiveModal(tokenVerificationModal(userId, token, usersToGrantAccess)));
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

interface DashboardStreakPanelProps {
    streakRecord: UserSnapshot | undefined;
}

const DashboardStreakPanel = ({ streakRecord }: DashboardStreakPanelProps) => {

    const streaksTooltip = useRef(null);
    const tooltip = <UncontrolledTooltip placement="auto" autohide={false} target={streaksTooltip}>
            The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/><br/>
            Answer at least ten question parts correctly per week to fill up your weekly progress bar and increase your streak!
    </UncontrolledTooltip>;

    const remainingToAnswer = 10 - (streakRecord?.weeklyStreakRecord?.currentActivity || 0);

    return <div className='w-100 dashboard-panel'>
        <h4>Build your weekly streak</h4>
        <div className={"streak-panel-gauge align-self-center text-center mb-3"}>
            <DashboardStreakGauge streakRecord={streakRecord}/>
        </div>
        <div className="streak-text mb-2">
            {remainingToAnswer <= 0
                ? `You've maintained your streak for this week!`
                : `Only ${remainingToAnswer} more question parts to answer correctly this week!`
            }
        </div>
        <Spacer/>
        <Button className="numeric-help d-flex align-items-center p-0 gap-2 panel-link mt-2" color="link" size="sm" innerRef={streaksTooltip}>
            <i className="icon icon-info layered icon-color-grey"/> What is this?
        </Button>
        {tooltip}
    </div>;
};

interface AssignmentCardProps {
    assignment: IAssignmentLike;
    isTeacherDashboard?: boolean;
    groups?: AppGroup[] | undefined;
}

export const AssignmentCard = (props: AssignmentCardProps) => {
    const { assignment, isTeacherDashboard, groups } = props;
    const today = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) : undefined; // 1000*60*60*24

    // QuizAssignmentDTOs don't have group names
    const groupIdToName = useMemo<{[id: number]: string | undefined}>(() => groups?.reduce((acc, group) => group?.id ? {...acc, [group.id]: group.groupName} : acc, {} as {[id: number]: string | undefined}) ?? {}, [groups]);

    const groupName = isQuiz(assignment) ? groupIdToName[assignment.groupId as number]
        : isAssignment(assignment) ? assignment.groupName
            : "";

    const link = isQuiz(assignment) ? (isTeacherDashboard ? `${PATHS.TEST}/${assignment.id}/feedback` : `${PATHS.TEST}/${assignment.id}`)
        : isAssignment(assignment) ? (isTeacherDashboard ? `${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}` : `${PATHS.GAMEBOARD}#${assignment.gameboardId}`)
            : "";

    const title = isQuiz(assignment) ? assignment.quizSummary?.title
        : isAssignment(assignment) ? assignment.gameboard?.title
            : "";

    const icon = isQuiz(assignment) ? "icon icon-tests"
        : isAssignment(assignment) ? "icon icon-question-deck"
            : "";

    return <Link to={link} className="w-100">
        <Card className="assignment-card px-3 d-flex flex-column h-100">
            <h5 className="d-inline">
                <i className={`${icon} me-2`}/>
                {title}
            </h5>
            <Spacer/>
            <div className="d-flex text-nowrap">
                {dueDate && (isOverdue(assignment) ? <span className="overdue me-3">Overdue</span> : <span className="me-3">Due in {daysUntilDue} day{daysUntilDue !== 1 && "s"}</span>)}
                <span className="group-name">{groupName}</span>
            </div>
        </Card>
    </Link>;
};

interface CurrentWorkPanelProps {
    assignments: AssignmentDTO[] | undefined;
    quizAssignments: QuizAssignmentDTO[] | undefined;
    groups: AppGroup[] | undefined;
}

const CurrentWorkPanel = ({assignments, quizAssignments, groups}: CurrentWorkPanelProps) => {

    if (!isDefined(assignments) || !isDefined(quizAssignments)) {
        return <div className="dashboard-panel"/>;
    }

    const isComplete = (quiz: IAssignmentLike) => convertAssignmentToQuiz(quiz)?.status === QuizStatus.Complete;

    // we can show overdue assignments, as students can still complete them; we cannot show overdue quizzes as you cannot take them after the due date
    const sortedQuizAssignments = quizAssignments ? sortUpcomingAssignments(quizAssignments).filter(quiz => !isOverdue(quiz) && !isComplete(quiz)) : [];
    
    
    const myAssignments = filterAssignmentsByStatus(assignments);

    // Get the 2 most urgent due dates from assignments & quizzes combined
    // To avoid merging & re-sorting entire lists, get the 2 most urgent from each list first
    const assignmentsToDo = [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld].slice(0, 2);
    const quizzesToDo = sortedQuizAssignments.slice(0, 2);
    const toDo = sortUpcomingAssignments([...assignmentsToDo, ...quizzesToDo]).slice(0, 2);

    return <div className='w-100 dashboard-panel'>
        <h4>Complete current work</h4>
        {toDo.length === 0 
            ? <div className="mt-3 mt-lg-0 mt-xl-3 text-center">You have no active assignments.</div> 
            : <>
                <span className="mb-2">You have assignments that are active or due soon:</span>
                <div className="row">
                    {toDo.map((assignment: IAssignmentLike) => <span key={assignment.id} className="d-flex col-12 col-lg-6 col-xl-12 mb-3"><AssignmentCard assignment={assignment} groups={groups}/></span>)}
                </div>
                <Spacer/>
                <div className="d-flex align-items-center">
                    <Link to="/assignments" className="d-inline panel-link">
                        See all assignments
                    </Link>
                    <Link to="/tests" className="d-inline panel-link ms-auto ms-lg-5 ms-xl-auto">
                        See all tests
                    </Link>
                </div>
            </>}
    </div>;
};

interface MyIsaacPanelProps {
    assignmentsCount: number;
    quizzesCount: number;
};

const MyIsaacPanel = ({assignmentsCount, quizzesCount}: MyIsaacPanelProps) => {
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

interface StudentDashboardProps {
    assignments: AssignmentDTO[] | undefined;
    quizAssignments: QuizAssignmentDTO[] | undefined;
    streakRecord: UserSnapshot | undefined;
    groups: AppGroup[] | undefined;
}

export const StudentDashboard = ({assignments, quizAssignments, streakRecord, groups}: StudentDashboardProps) => {
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = isLoggedIn(user) && !isTutorOrAbove(user) && user.givenName;

    const {assignmentsCount, quizzesCount} = getActiveWorkCount(assignments, quizAssignments);

    return <div className={classNames("dashboard w-100", {"dashboard-outer": !isTutorOrAbove(user)})}>
        {nameToDisplay && <span className="welcome-text">Welcome back, {nameToDisplay}!</span>}
        {deviceSize === "lg"
            ? <>
                <Row>
                    <Col className="mt-4">
                        <CurrentWorkPanel assignments={assignments} quizAssignments={quizAssignments} groups={groups} />
                    </Col>
                </Row>
                <Row className="row-cols-3">
                    <Col className="mt-4 panel-streak">
                        <DashboardStreakPanel streakRecord={streakRecord} />
                    </Col>
                    <Col className="mt-4">
                        <GroupJoinPanel />
                    </Col>
                    <Col className="mt-4">
                        <MyIsaacPanel assignmentsCount={assignmentsCount} quizzesCount={quizzesCount} />
                    </Col>
                </Row></>
            : <>
                <Row className="row-cols-1 row-cols-sm-2 row-cols-xl-4">
                    <Col className="mt-4 col-xl-4">
                        <CurrentWorkPanel assignments={assignments} quizAssignments={quizAssignments} groups={groups} />
                    </Col>
                    <Col className="mt-4 col-xl-2 panel-streak">
                        <DashboardStreakPanel streakRecord={streakRecord} />
                    </Col>
                    <Col className="mt-4 col-sm-7 col-xl-3">
                        <GroupJoinPanel />
                    </Col>
                    <Col className="mt-4 col-sm-5 col-xl-3">
                        <MyIsaacPanel assignmentsCount={assignmentsCount} quizzesCount={quizzesCount} />
                    </Col>
                </Row></>
        }
    </div>;
};
