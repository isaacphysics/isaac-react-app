import {isaacApi, selectors, useAppSelector} from "../../state";
import {AssignmentDTO, GameboardDTO, RegisteredUserDTO, UserGroupDTO} from "../../../IsaacApiTypes";
import {sortBy, groupBy, mapValues} from "lodash";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, {useContext, useMemo, useState} from "react";
import {Container, Row, Col, Button} from "reactstrap";
import {BoardLimit} from "../../services/gameboards";
import {BoardOrder, ManageAssignmentContext} from "../../../IsaacAppTypes";
import {calculateHexagonProportions, Hexagon} from "../elements/svg/Hexagon";
import {MONTH_NAMES} from "../../services/constants";
import classNames from "classnames";

const NewAssignment = ({date}: {date: Date}) => {
    return <>
        <h3>Create a new assignment</h3>
        <p>Select from your gameboards...</p>
        <p>Select one or more groups...</p>
        <p>Set a start date and a due date...</p>
        <Button>Create</Button>
    </>;
}

interface AssignmentListEntryProps {
    assignment: AssignmentDTO;
    group?: UserGroupDTO;
}
const AssignmentListEntry = ({assignment, group}: AssignmentListEntryProps) => {
    return <div>
        <p>Gameboard: {assignment.gameboard?.title}</p>
        <p>Group: {assignment.groupName}</p>
        {assignment.dueDate && <p>Due date: {new Date(assignment.dueDate).toDateString()}</p>}
    </div>
}

const DateAssignmentList = ({date, assignments}: {date: number; assignments: AssignmentDTO[]}) => {
    const [open, setOpen] = useState<boolean>(false);
    const {boardsById, groupsById} = useContext(ManageAssignmentContext);
    // If the hexagon proportions change, the CSS class bg-timeline needs revisiting
    const miniHexagon = useMemo(() => calculateHexagonProportions(20, 1), []);
    return <>
        <div onClick={() => setOpen(o => !o)} className={"hexagon-date"}>
            <svg height={miniHexagon.quarterHeight * 4} width={"100%"}>
                <Hexagon className={"fill-secondary"} {...miniHexagon}/>
                {<foreignObject height={miniHexagon.quarterHeight * 4} width={"100%"} y={11} x={miniHexagon.halfWidth * 2.5 + 12}>
                    <p className={classNames({"text-muted": !open})}>{assignments.length} assignment{assignments.length > 1 ? "s" : ""}</p>
                </foreignObject>}
                <svg x={2.5 * miniHexagon.halfWidth - (open ? 7 : 3)} y={miniHexagon.quarterHeight * 2 - (open ? 3 : 6.5)}>
                    <polygon className={"fill-secondary"} style={{opacity: open ? 1 : 0.5}} points="0 1.75 1.783 0 8.75 7 1.783 14 0 12.25 5.25 7"
                             transform={open ? "rotate(90 7 7.5)" : "rotate(0 7 7.5)"}/>
                </svg>
                {<foreignObject height={miniHexagon.quarterHeight * 4} width={miniHexagon.halfWidth * 2} y={2} x={0}>
                    <div className={"position-relative w-100"}>
                        <h3 className={"position-absolute text-white"} style={{left: "50%", transform: "translate(-50%)"}} >{`${date < 10 ? "0" : ""}${date}`}</h3>
                    </div>
                </foreignObject>}
            </svg>
        </div>
        {open && <div className={"date-assignment-list"}>
            {assignments.map(a => <AssignmentListEntry assignment={{...a, gameboard: a.gameboardId ? boardsById[a.gameboardId] : undefined}} group={a.groupId ? groupsById[a.groupId] : undefined} /> )}
        </div>}
    </>
}

const MonthAssignmentList = ({month, datesAndAssignments}: {month: number, datesAndAssignments: [number, AssignmentWithListingDate[]][]}) => {
    return <>
        <div className={"month-label w-100 text-right d-flex"}><div className={"ml-4 flex-grow-1 border-bottom"} style={{height: "1.05rem"}}/><h4 className={"ml-3"}>{`${MONTH_NAMES[month]}`}</h4></div>
        {datesAndAssignments.map(([d, as]) => <DateAssignmentList date={d} assignments={as}/>)}
    </>;
}

type AssignmentsGroupedByDate = [number, [number, [number, AssignmentWithListingDate[]][]][]][];
const AssignmentTimeline = ({assignmentsGroupedByDate}: {assignmentsGroupedByDate: AssignmentsGroupedByDate}) => {
    return <div className={"timeline w-100"}>
        {assignmentsGroupedByDate.map(([y, ms]) =>
            <>
                <div className={"year-label w-100 text-right"}><h3 className={"mb-n3"}>{`${y}`}</h3><hr/></div>
                {ms.map(([m, ds]) => <MonthAssignmentList month={m} datesAndAssignments={ds}/>)}
            </>
        )}
        <div className={"bg-timeline"}/>
    </div>
}

interface AssignmentWithListingDate extends AssignmentDTO {
    listingDate: Date;
}

export const ManageAssignments = () => {
    // We know the user is logged in and is at least a teacher in order to visit this page
    const user = useAppSelector(selectors.user.orNull) as RegisteredUserDTO;
    const { data: assignmentsSetByMe } = isaacApi.endpoints.getMySetAssignments.useQuery(undefined);
    const { data: gameboards } = isaacApi.endpoints.getGameboards.useQuery({startIndex: 0, limit: BoardLimit.All, sort: BoardOrder.created});
    const { data: groups } = isaacApi.endpoints.getGroups.useQuery(false);

    const boardsById = useMemo<{[id: string]: GameboardDTO}>(() => {
        return gameboards?.boards.reduce((acc, b) => b.id ? {...acc, [b.id]: b} : acc, {} as {[id: string]: GameboardDTO}) ?? {};
    }, [gameboards]);

    const groupsById = useMemo<{[id: number]: UserGroupDTO}>(() => {
        return groups?.reduce((acc, g) => g.id ? {...acc, [g.id]: g} : acc, {} as {[id: number]: UserGroupDTO}) ?? {};
    }, [groups]);

    const assignmentsGroupedByDate = useMemo<AssignmentsGroupedByDate>(() => {
        if (!assignmentsSetByMe) return [];
        const sortedAssignments: AssignmentWithListingDate[] = sortBy(assignmentsSetByMe.map(a => ({...a, listingDate: new Date((a.scheduledStartDate ?? a.creationDate ?? 0).valueOf())})), a => a.listingDate.valueOf());
        function parseNumericKey<T>([k, v]: [string, T]): [number, T] { return [parseInt(k), v]; }
        return Object.entries(mapValues(
            groupBy(sortedAssignments, a => a.listingDate.getUTCFullYear()),
            as => Object.entries(mapValues(
                groupBy(as, a => a.listingDate.getUTCMonth()),
                _as => Object.entries(groupBy(_as, a => a.listingDate.getUTCDate())).map(parseNumericKey)
            )).map(parseNumericKey)
        )).map(parseNumericKey);
    }, [assignmentsSetByMe]);

    // const latestDate = assignmentsGroupedByDate[0][0];
    // const earliestDate = assignmentsGroupedByDate[0][0];

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Set assignments"} help={<span>
            Use this page to set and manage assignments to your groups. You can assign any gameboard you have saved to your account.
            <br/>
            Students in the group will be emailed when you set a new assignment.
        </span>} modalId={"manage_assignments_help"}/>
        <ManageAssignmentContext.Provider value={{boardsById, groupsById}}>
            <Row>
                <Col className={"overflow-auto"}>
                    <AssignmentTimeline assignmentsGroupedByDate={assignmentsGroupedByDate}/>
                </Col>
                <Col>
                    <NewAssignment date={new Date()}/>
                </Col>
            </Row>
        </ManageAssignmentContext.Provider>
    </Container>;
}