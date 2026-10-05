import React, { useMemo, useRef, useState } from 'react';
import { selectors, useAppDispatch, useAppSelector, useLazyGetTokenOwnerQuery } from '../../state';
import { DashboardStreakGauge } from './views/StreakGauge';
import { Button, Card, Col, Input, InputGroup, Row, UncontrolledTooltip } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getAllSortedWorkToDo, isAssignment, isDefined, isLoggedIn, isOverdue, isQuiz, isTutorOrAbove, PATHS, useDeviceSize } from '../../services';
import { AssignmentDTO, IAssignmentLike, QuizAssignmentDTO } from '../../../IsaacApiTypes';
import { Spacer } from './Spacer';
import classNames from 'classnames';
import { AppGroup, UserSnapshot } from '../../../IsaacAppTypes';
import { authenticateWithTokenAfterPrompt } from './panels/TeacherConnections';
import { getFriendlyDaysUntil } from './DateString';
import { FeatureFlag, useFeatureFlag } from '../../services/featureFlag';
import { Trans, useTranslation } from "react-i18next";

const GroupJoinPanel = () => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const dispatch = useAppDispatch();
    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const [authenticationToken, setAuthenticationToken] = useState<string | null>();

    function processToken(event: React.FormEvent<HTMLFormElement | HTMLButtonElement | HTMLInputElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (user && user.loggedIn && user.id && isDefined(authenticationToken)) {
            authenticateWithTokenAfterPrompt(user.id, authenticationToken, dispatch, getTokenOwner);
        }
    }

    return <div className='w-100 dashboard-panel'>
        <h4>{t("common:dashboard.groupJoin.title")}</h4>
        {t("common:dashboard.groupJoin.description")}
        <InputGroup className="my-4 separate-input-group">
            <Input
                type="text" placeholder={t("common:dashboard.groupJoin.placeholder")}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                onKeyDown={(e) => {if (e.key === 'Enter') {
                    e.preventDefault();
                }}}
            />
            <Button onClick={processToken} color="solid">
                {t("common:dashboard.groupJoin.connectButton")}
            </Button>
        </InputGroup>
        <Spacer/>
        <Link to="/account#teacherconnections" className="panel-link">
            {t("common:dashboard.groupJoin.existingGroupsLink")}
        </Link>
    </div>;
};

interface DashboardStreakPanelProps {
    streakRecord: UserSnapshot | undefined;
}

const DashboardStreakPanel = ({ streakRecord }: DashboardStreakPanelProps) => {
    const { t } = useTranslation();

    const streaksTooltip = useRef(null);
    const tooltip = <UncontrolledTooltip placement="bottom" autohide={false} target={streaksTooltip}>
        <Trans i18nKey="common:dashboard.streak.tooltip" components={{ br1: <br />, br2: <br /> }} />
    </UncontrolledTooltip>;

    const remainingToAnswer = 10 - (streakRecord?.weeklyStreakRecord?.currentActivity || 0);
    const streakLength = (streakRecord?.weeklyStreakRecord?.currentStreak || 0);
    const inStreakFreezeRange = new Date(1766361600000) <= new Date() && new Date() <= new Date(1767571200000);

    return <div className='w-100 dashboard-panel'>
        <h4>{t("common:dashboard.streak.title")}</h4>
        <div className={"streak-panel-gauge align-self-center text-center mb-3"}>
            <DashboardStreakGauge streakRecord={streakRecord}/>
        </div>
        <div className="streak-text mb-2">
            {streakLength >= 1 && inStreakFreezeRange
                ? t("common:dashboard.streak.festiveFreeze")
                : remainingToAnswer <= 0
                    ? t("common:dashboard.streak.maintained")
                    : t("common:dashboard.streak.remaining", { remainingParts: remainingToAnswer })

            }
        </div>
        <Spacer/>
        <Button className="d-flex align-items-center p-0 gap-2 panel-link mt-2" color="link" size="sm" innerRef={streaksTooltip}>
            <i className="icon icon-info icon-color-grey"/> {t("common:dashboard.streak.infoLink")}
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
    const { t } = useTranslation();
    const { assignment, isTeacherDashboard, groups } = props;
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;

    const isAssignmentsV2Link = useFeatureFlag(FeatureFlag.ASSIGNMENTS_V2);

    // QuizAssignmentDTOs don't have group names
    const groupIdToName = useMemo<{[id: number]: string | undefined}>(() => groups?.reduce((acc, group) => group?.id ? {...acc, [group.id]: group.groupName} : acc, {} as {[id: number]: string | undefined}) ?? {}, [groups]);

    const groupName = isQuiz(assignment) 
        ? groupIdToName[assignment.groupId as number]
        : isAssignment(assignment) 
            ? assignment.groupName
            : "";

    const link = isQuiz(assignment)
        ? (isTeacherDashboard 
            ? `${PATHS.TEST}/${assignment.id}/feedback` 
            : `${PATHS.TEST}/${assignment.id}`
        ) : isAssignment(assignment) 
            ? (isTeacherDashboard
                ? `${PATHS.ASSIGNMENT_PROGRESS}/${assignment.id}`
                : (isAssignmentsV2Link ? `/assignment/${assignment.id}/view` : `${PATHS.GAMEBOARD}#${assignment.gameboardId}`)
            )
            : "";

    const title = isQuiz(assignment)
        ? assignment.quizSummary?.title
        : isAssignment(assignment)
            ? assignment.gameboard?.title
            : "";

    const icon = isQuiz(assignment)
        ? "icon icon-tests"
        : isAssignment(assignment)
            ? "icon icon-question-deck"
            : "";

    return <Link to={link} className="w-100">
        <Card className="assignment-card px-3 d-flex flex-column h-100">
            <h5 className="d-inline">
                <i className={`${icon} icon-inline me-2`}/>
                {title}
            </h5>
            <Spacer/>
            <div className="d-flex text-nowrap">
                {dueDate && (isOverdue(assignment) ? <span className="overdue me-3">{t("common:dashboard.currentWork.overdue")}</span> : <span className="me-3">{t("common:dashboard.currentWork.dueDate", { dueLabel: getFriendlyDaysUntil(dueDate) })}</span>)}
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
    const { t } = useTranslation();
    if (!isDefined(assignments) || !isDefined(quizAssignments)) {
        return <div className="dashboard-panel"/>;
    }

    const {all: toDo} = getAllSortedWorkToDo(assignments, quizAssignments, 2);

    return <div className='w-100 dashboard-panel'>
        <h4>{t("common:dashboard.currentWork.title")}</h4>
        {toDo.length === 0 
            ? <div className="mt-3 mt-lg-0 mt-xl-3 text-center">
                <span className="mb-2 row d-flex justify-content-center">{t("common:dashboard.currentWork.emptyState")}</span>
                <Link to="/assignments" className="d-inline panel-link">
                    {t("common:dashboard.currentWork.viewOlderLink")}
                </Link>
            </div> 
            : <>
                <span className="mb-2">{t("common:dashboard.currentWork.activeIntro")}</span>
                <div className="row overflow-y-auto pt-1 mt-n1">
                    {toDo.map((assignment: IAssignmentLike) => <div key={assignment.id} className="d-flex col-12 col-lg-6 col-xl-12 mb-3">
                        <AssignmentCard assignment={assignment} groups={groups}/>
                    </div>)}
                </div>
                <Spacer/>
                <div className="d-flex align-items-center">
                    <Link to="/assignments" className="d-inline panel-link">
                        {t("common:dashboard.currentWork.allAssignmentsLink")}
                    </Link>
                    <Link to="/tests" className="d-inline panel-link ms-auto ms-lg-7 ms-xl-auto">
                        {t("common:dashboard.currentWork.allTestsLink")}
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
    const { t } = useTranslation();
    return <div className='w-100 dashboard-panel'>
        <h4>{t("common:dashboard.myIsaac.title")}</h4>
        <div className="d-flex flex-column">
            <Link to={PATHS.MY_GAMEBOARDS} className="panel-my-isaac-link">
                {t("common:dashboard.myIsaac.savedDecks")}
            </Link>
            <Link to="/assignments" className="panel-my-isaac-link">
                {t("common:dashboard.myIsaac.assignments")}
                {assignmentsCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{assignmentsCount > 99 ? "99+" : assignmentsCount}</span>}
            </Link>
            <Link to="/progress" className="panel-my-isaac-link">
                {t("common:dashboard.myIsaac.progress")}
            </Link>
            <Link to="/tests" className="panel-my-isaac-link">
                {t("common:dashboard.myIsaac.tests")}
                {quizzesCount > 0 && <span className="badge bg-primary rounded-5 ms-2">{quizzesCount > 99 ? "99+" : quizzesCount}</span>}
            </Link>
            <div className="section-divider"/>
            <Link to="/account" className="panel-my-isaac-link">
                {t("common:dashboard.myIsaac.account")}
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
    const { t } = useTranslation();
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);
    const nameToDisplay = isLoggedIn(user) && !isTutorOrAbove(user) && user.givenName;

    const {all: _, assignmentsCount, quizzesCount} = getAllSortedWorkToDo(assignments, quizAssignments);

    return <div className={classNames("dashboard w-100", {"dashboard-outer": !isTutorOrAbove(user)})}>
        {nameToDisplay && <h3>{t("common:dashboard.greeting", { studentName: nameToDisplay })}</h3>}
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
