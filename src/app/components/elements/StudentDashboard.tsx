import React, { useEffect, useState } from 'react';
import { closeActiveModal, getMyProgress, openActiveModal, selectors, showErrorToast, store, useAppDispatch, useAppSelector, useGetMyAssignmentsQuery, useLazyGetTokenOwnerQuery } from '../../state';
import { DashboardStreakGauge } from './views/StreakGauge';
import { Button, Card, Col, Input, InputGroup, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { filterAssignmentsByStatus, isDefined, isLoggedIn, isTutorOrAbove, PATHS, useDeviceSize } from '../../services';
import { tokenVerificationModal } from './modals/TeacherConnectionModalCreators';
import { AssignmentDTO } from '../../../IsaacApiTypes';
import { useAssignmentsCount } from '../navigation/NavigationBar';
import { ShowLoadingQuery } from '../handlers/ShowLoadingQuery';
import { Spacer } from './Spacer';

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

    const streaksInfoModal = () => openActiveModal({
        closeAction: () => store.dispatch(closeActiveModal()),
        title: "Weekly streaks",
        body: <div className="mb-4">
            The weekly streak indicates the number of consecutive weeks you have been active on Isaac.<br/><br/>
            Answer at least ten question parts correctly per week to fill up your weekly progress bar and increase your streak!
        </div>
    });

    const remainingToAnswer = 10 - (myProgress?.userSnapshot?.weeklyStreakRecord?.currentActivity || 0);

    return <div className='w-100 dashboard-panel'>
        <h4>Build your weekly streak</h4>
        <div className={"streak-panel-gauge align-self-center text-center mb-3"}>
            <DashboardStreakGauge streakRecord={myProgress?.userSnapshot}/>
        </div>
        {remainingToAnswer === 0 ? <div className="streak-text">You&apos;ve maintained your streak for this week!</div> : <div className="streak-text">Only {remainingToAnswer} more question parts to answer correctly this week!</div>}
        <Spacer/>
        <button onClick={() => dispatch(streaksInfoModal())} className="mt-2 p-0 panel-link">
            What is this?<img src="/assets/common/icons/chevron_down.svg" className="ms-1" alt=""/> { /* TODO replace this icon since this isn't a dropdown */ }
        </button>
    </div>;
};

const AssignmentCard = (assignment: AssignmentDTO) => {
    const today = new Date();
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
    const isOverdue = dueDate && dueDate < today;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) : undefined; // 1000*60*60*24
    return <Card className="assignment-card px-3">
        <Row>
            <i className="icon icon-question-pack" />
            <Col>
                <Link to={`${PATHS.GAMEBOARD}#${assignment.gameboardId}`} style={{textDecoration: "none"}}>
                    <h5>{isDefined(assignment.gameboard) && assignment.gameboard.title}</h5>
                </Link><br/>
                <>{isDefined(assignment.groupName) && assignment.groupName}</>
            </Col>
            <Col>            
                {dueDate && (isOverdue ? <p className="due-date overdue">Overdue</p> : <p className="due-date">Due in {daysUntilDue} day{daysUntilDue !== 1 && "s"}</p>)}
            </Col>
        </Row>
        
    </Card>;
};

const CurrentWorkPanel = () => {
    const assignmentQuery = useGetMyAssignmentsQuery(undefined, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    return <div className='w-100 dashboard-panel'>
        <h4>Complete current work</h4>
        <>You have assignments that are active or due soon:</>
        <br/><br/>
        <ShowLoadingQuery
            query={assignmentQuery}
            defaultErrorTitle={"Error fetching your assignments"}
            thenRender={(assignments) => {
                const myAssignments = filterAssignmentsByStatus(assignments);
                const toDo = [...myAssignments.inProgressRecent, ...myAssignments.inProgressOld].slice(0, 2);
                return <>{toDo.map((assignment: AssignmentDTO) => {return <><AssignmentCard key={assignment.id} {...assignment} /><br/></>;})}</>;
            }
            }/>
    </div>;
};

const MyIsaacPanel = () => {
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();
    return <div className='w-100 dashboard-panel'>
        <h4>More in My Isaac</h4>
        <div>
            <Link to="/my_gameboards" className="panel-link">
                My question packs
            </Link><br/>
            <Link to="/assignments" className="panel-link">
                My assignments
                {assignmentsCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{assignmentsCount > 99 ? "99+" : assignmentsCount}</span>}
            </Link><br/>
            <Link to="/progress" className="panel-link">
                My progress
            </Link><br/>
            <Link to="/tests" className="panel-link">
                My tests
                {quizzesCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{quizzesCount > 99 ? "99+" : quizzesCount}</span>}
            </Link>
            <div className="section-divider"/>
            <Link to="/account" className="panel-link">
                My account
            </Link>
        </div>
    </div>; 
};

export const StudentDashboard = () => {
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    if (user && isLoggedIn(user) && !isTutorOrAbove(user)) {
        return <div className="dashboard w-100">
            <span className="physics-welcome-text">Welcome back, {user.givenName}!</span>
            {deviceSize === "lg"
                ? <>
                    <Row className="row-cols-3">
                        <Col className="mt-4">
                            <GroupJoinPanel />
                        </Col>
                        <Col className="mt-4 panel-streak">
                            <DashboardStreakPanel />
                        </Col>
                        <Col className="mt-4">
                            <MyIsaacPanel />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="mt-4">
                            <CurrentWorkPanel />
                        </Col>
                    </Row></>
                : <>
                    <Row className="row-cols-1 row-cols-sm-2 row-cols-xl-4">
                        <Col className="mt-4 col-xl-3">
                            <GroupJoinPanel />
                        </Col>
                        <Col className="mt-4 col-xl-2 panel-streak">
                            <DashboardStreakPanel />
                        </Col>
                        <Col className="mt-4 col-sm-7 col-xl-4">
                            <CurrentWorkPanel />
                        </Col>
                        <Col className="mt-4 col-sm-5 col-xl-3">
                            <MyIsaacPanel />
                        </Col>
                    </Row></>
            }
        </div>;
    }
};