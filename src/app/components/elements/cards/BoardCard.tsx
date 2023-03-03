import {
    BoardViews,
    determineGameboardStagesAndDifficulties,
    determineGameboardSubjects,
    difficultyShortLabelMap,
    formatBoardOwner,
    generateGameboardSubjectHexagons,
    isAda,
    isAdminOrEventManager,
    isDefined,
    PATHS,
    siteSpecific,
    stageLabelMap
} from "../../../services";
import {showErrorToast, unlinkUserFromGameboard, useAppDispatch} from "../../../state";
import {GameboardDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Circle} from "../svg/Circle";
import classNames from "classnames";
import {sortBy} from "lodash";
import {formatDate} from "../DateString";
import {ShareLink} from "../ShareLink";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardSubtitle,
    CardTitle,
    Col,
    CustomInput,
    Row,
    Spinner,
    UncontrolledTooltip
} from "reactstrap";
import React from "react";
import {Link} from "react-router-dom";
import {BoardAssignee, Boards} from "../../../../IsaacAppTypes";
import indexOf from "lodash/indexOf";


interface HexagonGroupsButtonProps {
    toggleAssignModal: () => void;
    boardSubjects: string[];
    assignees: BoardAssignee[];
    id: string;
}
const HexagonGroupsButton = ({toggleAssignModal, boardSubjects, assignees, id}: HexagonGroupsButtonProps) =>
    <button onClick={toggleAssignModal} id={id} className="board-subject-hexagon-container">
        {generateGameboardSubjectHexagons(boardSubjects)}
        <span className="groups-assigned" title={"Groups assigned"}>
                <strong>{isDefined(assignees) ? assignees.length : <Spinner size="sm" />}</strong>{" "}
            group{(!assignees || assignees.length != 1) && "s"}
            {isDefined(assignees) &&
            <UncontrolledTooltip placement={"top"} target={"#" + id}>{assignees.length === 0 ?
                "No groups have been assigned."
                : ("Gameboard assigned to: " + assignees.map(g => g.groupName).join(", "))}
            </UncontrolledTooltip>}
        </span>
    </button>;

type BoardCardProps = {
    user: RegisteredUserDTO;
    board: GameboardDTO;
    boards?: Boards | null;
    boardView: BoardViews;
    // Set assignments only
    assignees?: BoardAssignee[];
    toggleAssignModal?: () => void;
    // My gameboards only
    setSelectedBoards?: (e: any) => void;
    selectedBoards?: GameboardDTO[];
};

export const BoardCard = ({user, board, boardView, assignees, toggleAssignModal, setSelectedBoards, selectedBoards}: BoardCardProps) => {
    // Decides whether we show the "Assign/Unassign" button, along with other "Set Assignments"-specific stuff
    const isSetAssignments = isDefined(toggleAssignModal) && isDefined(assignees);

    const hexagonId = `board-hex-${board.id}`;
    const boardLink = isSetAssignments ? `/assignment/${board.id}` : `${PATHS.GAMEBOARD}#${board.id}`;
    const hasAssignedGroups = assignees && assignees.length > 0;

    const dispatch = useAppDispatch();

    const updateBoardSelection = (board: GameboardDTO, checked: boolean) => {
        if (!setSelectedBoards || !isDefined(selectedBoards)) return;
        if (checked) {
            setSelectedBoards([...selectedBoards, board]);
        } else {
            setSelectedBoards(selectedBoards.filter((thisBoard) => thisBoard.id !== board.id));
        }
    };

    function confirmDeleteBoard() {
        if (hasAssignedGroups) {
            if (isAdminOrEventManager(user)) {
                alert("Warning: You currently have groups assigned to this gameboard. If you delete this your groups will still be assigned but you won't be able to unassign them or see the gameboard in your assigned gameboards or 'My gameboards' page.");
            } else {
                dispatch(showErrorToast("Gameboard Deletion Not Allowed", "You have groups assigned to this gameboard. To delete this gameboard, you must unassign all groups."));
                return;
            }
        }

        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title}));
        }
    }

    const boardSubjects = determineGameboardSubjects(board);
    const boardStagesAndDifficulties = determineGameboardStagesAndDifficulties(board);

    const basicCellClasses = `align-middle ${siteSpecific("text-center", "text-left")}`;

    const phyHexagon = <div className={classNames("board-subject-hexagon-container", {"table-view": boardView === BoardViews.table})}>
        {isSetAssignments
            ? <HexagonGroupsButton toggleAssignModal={toggleAssignModal} boardSubjects={boardSubjects} assignees={assignees} id={hexagonId} />
            : ((board.percentageCompleted === 100)
                ? <span className="board-subject-hexagon subject-complete"/>
                : <>
                    {generateGameboardSubjectHexagons(boardSubjects)}
                    <div className="board-percent-completed">{board.percentageCompleted}</div>
                </>
        )}
    </div>;
    const csCircle = <svg className={"board-circle"} id={hexagonId} width={48} height={48}>
        <Circle radius={24} properties={{fill: "#000"}}/>
        <foreignObject className={classNames("board-percent-completed", {"set-assignments": isSetAssignments})} x={0} y={0} width={48} height={48}>
            {isSetAssignments
                ? <span title={"Number of groups assigned"}>
                    {isDefined(assignees)
                        ? <span className={assignees.length >= 100 ? "font-size-1" : "font-size-1-25"}>{assignees.length}</span>
                        : <Spinner size="sm" />
                    }<br/><small>groups</small>
                    {isDefined(assignees) &&
                        <UncontrolledTooltip placement={"top"} target={"#" + hexagonId}>{assignees.length === 0 ?
                            "No groups have been assigned to this quiz."
                            : ("Quiz assigned to: " + assignees.map(g => g.groupName).join(", "))}
                        </UncontrolledTooltip>
                    }
                </span>
                : <>{board.percentageCompleted}%</>
            }
        </foreignObject>
    </svg>;

    return boardView == BoardViews.table ?
        <tr className={siteSpecific("board-card", "")} data-testid={"my-gameboard-table-row"}>
            <td className={siteSpecific("", "align-middle text-center")}>
                {siteSpecific(
                    phyHexagon,
                    csCircle
                )}
            </td>
            <td colSpan={siteSpecific(1, 4)} className="align-middle">
                <a href={boardLink} className={isAda ? "font-weight-semi-bold" : ""}>{board.title}</a>
            </td>
            <td className={basicCellClasses + " p-0"} colSpan={2}>
                {boardStagesAndDifficulties.length > 0 && <table className="w-100 border-0">
                    <tbody>
                    {boardStagesAndDifficulties.map(([stage,difficulties], i) => {
                        return <tr key={stage} className={classNames({"border-0": i === 0, "border-left-0 border-right-0 border-bottom-0": i === 1})}>
                            <td className="text-center align-middle border-0 p-1 w-50">
                                {stageLabelMap[stage]}
                            </td>
                            <td className="text-center align-middle border-0 p-1 w-50">
                                {isAda && "("}{sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")}{isAda && ")"}
                            </td>
                        </tr>
                    })}
                    </tbody>
                </table>}
            </td>
            <td className={basicCellClasses}>{formatBoardOwner(user, board)}</td>
            <td className={basicCellClasses}>{formatDate(board.creationDate)}</td>
            <td className={basicCellClasses}>{formatDate(board.lastVisited)}</td>
            {isSetAssignments && <td className={basicCellClasses}>
                <Button color={siteSpecific("tertiary", "secondary")} size="sm" style={siteSpecific({fontSize: 15}, undefined)} onClick={toggleAssignModal}>
                    {siteSpecific(<>Assign&nbsp;/ Unassign</>, "Manage")}
                </Button>
            </td>}
            <td className={basicCellClasses}>
                <div className="table-share-link">
                    <ShareLink linkUrl={boardLink} gameboardId={board.id} outline={isAda} clickAwayClose={isAda} />
                </div>
            </td>
            {!isSetAssignments && siteSpecific(
                <td>
                    <CustomInput
                        id={`board-delete-${board.id}`}
                        type="checkbox"
                        checked={board && selectedBoards?.some(e => e.id === board.id)}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            board && updateBoardSelection(board, event.target.checked)
                        }} aria-label="Delete gameboard"
                    />
                </td>,
                <td className={"text-center align-middle overflow-hidden"}>
                    <CustomInput
                        id={`board-delete-${board.id}`}
                        type="checkbox"
                        color="secondary"
                        className={"isaac-checkbox mr-n2"}
                        checked={board && selectedBoards?.some(e => e.id === board.id)}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            board && updateBoardSelection(board, event.target.checked)
                        }} aria-label="Delete gameboard"
                    />
                </td>
            )}
        </tr>
        :
        siteSpecific(
            <Card className="board-card card-neat" data-testid={"my-gameboard-card"}>
                <CardBody className="pb-4 pt-4">
                    <button className="close" onClick={confirmDeleteBoard} aria-label="Delete gameboard">×</button>
                    {phyHexagon}
                    <aside>
                        <CardSubtitle>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                        <CardSubtitle>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                        <table className="w-100">
                            <thead>
                            <tr>
                                <th className="w-50 font-weight-light">
                                    {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}:`}
                                </th>
                                <th className="w-50 font-weight-light pl-1">
                                    {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                <td className="w-50 align-baseline text-lg-right">
                                    <strong>{stageLabelMap[stage]}:</strong>
                                </td>
                                <td className="w-50 pl-1">
                                    <strong>{difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}</strong>
                                </td>
                            </tr>)}
                            {boardStagesAndDifficulties.length === 0 && <tr>
                                <td className="w-50 align-baseline text-lg-right">
                                    <strong>N/A:</strong>
                                </td>
                                <td className="w-50 pl-1">
                                    <strong>-</strong>
                                </td>
                            </tr>}
                            </tbody>
                        </table>
                    </aside>
                    <Row className="mt-1 mb-2">
                        <Col>
                            <CardTitle><Link to={boardLink}>{board.title}</Link></CardTitle>
                            <CardSubtitle>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                        </Col>
                        <Col className="card-share-link col-auto">
                            <ShareLink linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose />
                        </Col>
                    </Row>
                </CardBody>
                {isSetAssignments && <CardFooter>
                    <Button className={"mb-1"} block color="tertiary" onClick={toggleAssignModal}>Assign / Unassign</Button>
                </CardFooter>}
            </Card>,
            <Card className={"board-card"} data-testid={"my-gameboard-card"}>
                <CardBody className="pb-4 pt-4">
                    <Row className={"mb-2"}>
                        <Col>
                            <div className={"float-left mr-3 mb-2"}>{csCircle}</div>
                            <h4><Link className={"d-inline"} to={boardLink}>{board.title}</Link></h4>
                            <span>By: {formatBoardOwner(user, board)}</span>
                        </Col>
                    </Row>
                    <Row className={isSetAssignments ? "mb-5 pb-3" : "mb-0"}>
                        <Col>
                            <b>Created</b>: {formatDate(board.creationDate)}<br/>
                            <b>Last visited</b>: {formatDate(board.lastVisited)}<br/>
                            <b>Stages and difficulties</b>: {boardStagesAndDifficulties.map(([stage,difficulties], i) =>
                            `${stageLabelMap[stage]} (${sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")})`
                        ).join(", ") || "-"}<br/>
                        </Col>
                    </Row>
                    <CardFooter className={"text-right p-3"}>
                        <ShareLink outline linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose className={"d-inline-block"} />
                        <Button outline color={"secondary"} className={"mr-0 bin-icon d-inline-block outline"} onClick={confirmDeleteBoard} aria-label="Delete gameboard"/>
                        {isSetAssignments && <Button className={"d-block w-100 assign-button"} color="secondary" onClick={toggleAssignModal}>Assign / Unassign</Button>}
                    </CardFooter>
                </CardBody>
            </Card>
        );
};
