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
    isPhy,
    PATHS,
    siteSpecific,
    stageLabelMap
} from "../../../services";
import {showErrorToast, unlinkUserFromGameboard, useAppDispatch} from "../../../state";
import {GameboardDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Circle} from "../svg/Circle";
import classNames from "classnames";
import sortBy from "lodash/sortBy";
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
import { Spacer } from "../Spacer";


interface HexagonGroupsButtonProps {
    toggleAssignModal: () => void;
    boardSubjects: string[];
    assignees: BoardAssignee[];
    id: string;
}
const HexagonGroupsButton = ({toggleAssignModal, boardSubjects, assignees, id}: HexagonGroupsButtonProps) =>
    <button onClick={toggleAssignModal} id={id} className="board-subject-hexagon-container">
        {generateGameboardSubjectHexagons(boardSubjects)}
        <span className="groups-assigned" title={"Number of groups assigned"}>
                <strong>{isDefined(assignees) ? assignees.length : <Spinner size="sm" />}</strong>{" "}
            group{(!assignees || assignees.length != 1) && "s"}
            {isDefined(assignees) &&
            <UncontrolledTooltip placement={"top"} target={"#" + id}>{assignees.length === 0 ?
                "No groups have been assigned."
                : (`${siteSpecific("Gameboard", "Quiz")} assigned to: ` + assignees.map(g => g.groupName).join(", "))}
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
                alert(`Warning: You currently have groups assigned to this gameboard. If you delete this your groups will still be assigned but you won't be able to unassign them or see the ${siteSpecific("gameboard", "quiz")} in your assigned ${siteSpecific("gameboards", "quizzes")} or '${siteSpecific("My gameboards", "My quizzes")}' page.`);
            } else {
                dispatch(showErrorToast(`${siteSpecific("Gameboard", "Quiz")} Deletion Not Allowed`, `You have groups assigned to this gameboard. To delete this ${siteSpecific("gameboard", "quiz")}, you must unassign all groups.`));
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

    const isTable = boardView === BoardViews.table;
    const phyHexagon = <div className={classNames("board-subject-hexagon-container", isTable ? "table-view" : "card-view")}>
        {isSetAssignments
            ? <HexagonGroupsButton toggleAssignModal={toggleAssignModal} boardSubjects={boardSubjects} assignees={assignees} id={hexagonId} />
            : ((board.percentageCompleted === 100)
                ? <>
                    <span className="board-subject-hexagon subject-complete"/>
                    <span className="sr-only">Complete</span>
                </>
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
                ? <div title={"Number of groups assigned"}>
                    {isDefined(assignees)
                        ? <span className={assignees.length >= 100 ? "font-size-1" : "font-size-1-25"}>{assignees.length}</span>
                        : <Spinner size="sm" />
                    }<br/><small>group{assignees.length !== 1 ? "s" : ""}</small>
                    {isDefined(assignees) &&
                        <UncontrolledTooltip placement={"top"} target={"#" + hexagonId}>{assignees.length === 0 ?
                            "No groups have been assigned to this quiz."
                            : ("Quiz assigned to: " + assignees.map(g => g.groupName).join(", "))}
                        </UncontrolledTooltip>
                    }
                </div>
                : <>{board.percentageCompleted}%</>
            }
        </foreignObject>
    </svg>;

    const stagesAndDifficultiesBorders = (i : number) => {
        return siteSpecific(`border-left-1 border-right-1 border-top-${i === 0 ? 0 : 1} border-bottom-${i === boardStagesAndDifficulties.length - 1 ? 0 : 1}`, "border-0");
    };

    return boardView == BoardViews.table ?
        <tr className={siteSpecific("board-card", "")} data-testid={"gameboard-table-row"}>
            <td className={siteSpecific("", "align-middle text-center")}>
                {siteSpecific(
                    phyHexagon,
                    csCircle
                )}
            </td>
            <td colSpan={siteSpecific(1, isSetAssignments ? 2 : 4)} className="align-middle">
                <a href={boardLink} className={isAda ? "font-weight-semi-bold" : ""}>{board.title}</a>
                {isPhy && <span className="text-muted"><br/>Created by {<span data-testid={"owner"}>{formatBoardOwner(user, board)}</span>}</span>}
            </td>
            <td className={basicCellClasses + " p-0"} colSpan={2}>
                {boardStagesAndDifficulties.length > 0 && <table className="w-100 border-0">
                    <tbody>
                    {boardStagesAndDifficulties.map(([stage,difficulties], i) => {
                        return <tr key={stage} className={classNames({"border-0": i === 0, "border-left-0 border-right-0 border-bottom-0": i >= 1})}>
                            <td className={`text-center align-middle ${stagesAndDifficultiesBorders(i)} p-1 w-50`}>
                                {stageLabelMap[stage]}
                            </td>
                            <td className={`text-center align-middle ${stagesAndDifficultiesBorders(i)} p-1 w-50`}>
                                {isAda && "("}{sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")}{isAda && ")"}
                            </td>
                        </tr>;
                    })}
                    </tbody>
                </table>}
            </td>
            {isAda && <td className={basicCellClasses} data-testid={"owner"}>{formatBoardOwner(user, board)}</td>}
            {!isSetAssignments && <td className="align-middle text-center">{formatDate(board.creationDate)}</td>}
            <td className={basicCellClasses} data-testid={"last-visited"}>{formatDate(board.lastVisited)}</td>
            {isSetAssignments && <td className={"align-middle text-center"}>
                <Button className="set-assignments-button" color={siteSpecific("tertiary", "secondary")} size="sm" onClick={toggleAssignModal}>
                    Assign{hasAssignedGroups && "\u00a0/ Unassign"}
                </Button>
            </td>}
            {isAda && <td className={basicCellClasses}>
                <div className="table-share-link">
                    <ShareLink linkUrl={boardLink} gameboardId={board.id} outline={isAda} clickAwayClose={isAda} />
                </div>
            </td>}
            {isSetAssignments && isAda && <td className={basicCellClasses}>
                <Button outline color={"secondary"} className={"bin-icon d-inline-block outline"} onClick={confirmDeleteBoard} aria-label="Delete quiz"/>
            </td>}
            {!isSetAssignments && siteSpecific(
                <td className={"text-center align-middle"}>
                    <Button outline color="primary" className={"bin-icon d-inline-block outline"} style={{
                        width: "20px",
                        minWidth: "20px",
                    }} onClick={confirmDeleteBoard} aria-label="Delete quiz"/>
                </td>,
                <td className={"text-center align-middle overflow-hidden"}>
                    <CustomInput
                        id={`board-delete-${board.id}`}
                        type="checkbox"
                        color="secondary"
                        className={"isaac-checkbox mr-n2"}
                        checked={board && selectedBoards?.some(e => e.id === board.id)}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            board && updateBoardSelection(board, event.target.checked);
                        }} aria-label="Delete quiz"
                    />
                </td>
            )}
        </tr>
        :
        siteSpecific(
            <Card className="board-card card-neat" data-testid={"gameboard-card"}>
                <CardBody className="d-flex flex-column pb-4 pt-4">
                    <button className="close" onClick={confirmDeleteBoard} aria-label="Delete gameboard">×</button>
                    {phyHexagon}
                    <Row className="mt-1 mb-2">
                        <Col lg={8} md={8} sm={10} xs={8}>
                            <CardTitle><Link to={boardLink}>{board.title}</Link></CardTitle>
                            <CardSubtitle data-testid={"owner"}>By: <strong>{formatBoardOwner(user, board)}</strong></CardSubtitle>
                        </Col>
                    </Row>
                    <CardSubtitle data-testid={"created-date"}>Created: <strong>{formatDate(board.creationDate)}</strong></CardSubtitle>
                    <CardSubtitle data-testid={"last-visited"}>Last visited: <strong>{formatDate(board.lastVisited)}</strong></CardSubtitle>
                    <br />
                    <table className="w-100">
                        <thead>
                        <tr>
                            <th className="w-50">
                                <strong>{`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}`}</strong>
                            </th>
                            <th className="w-50 pl-1">
                                <strong>{`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}</strong>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                            <td className="w-50 align-baseline text-lg">
                                {stageLabelMap[stage]}
                            </td>
                            <td className="w-50 pl-1">
                                {difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}
                            </td>
                        </tr>)}
                        {boardStagesAndDifficulties.length === 0 && <tr>
                            <td className="w-50 align-baseline text-lg">
                                N/A
                            </td>
                            <td className="w-50 pl-1">
                                -
                            </td>
                        </tr>}
                        </tbody>
                    </table>
                    <Spacer />
                    <Col className="card-share-link col-auto">
                        <ShareLink linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose />
                    </Col>
                    
                </CardBody>
                {isSetAssignments && <CardFooter>
                    <Button className={"mb-1"} block color="tertiary" onClick={toggleAssignModal}>
                        Assign{hasAssignedGroups && " / Unassign"}
                    </Button>
                </CardFooter>}
            </Card>,
            <Card className={"board-card"} data-testid={"gameboard-card"}>
                <CardBody className="pb-4 pt-4">
                    <Row className={"mb-2"}>
                        <Col>
                            <div className={"float-left mr-3 mb-2"}>{csCircle}</div>
                            <h4><Link className={"d-inline"} to={boardLink}>{board.title}</Link></h4>
                            <span data-testid={"owner"}>By: {formatBoardOwner(user, board)}</span>
                        </Col>
                    </Row>
                    <Row className={isSetAssignments ? "mb-5 pb-3" : "mb-0"}>
                        <Col>
                            <span data-testid={"created-date"}><b>Created</b>: {formatDate(board.creationDate)}</span><br/>
                            <span data-testid={"last-visited"}><b>Last visited</b>: {formatDate(board.lastVisited)}</span><br/>
                            <b>Stages and difficulties</b>: {boardStagesAndDifficulties.map(([stage,difficulties], _) =>
                                `${stageLabelMap[stage]} (${sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")})`
                            ).join(", ") || "-"}<br/>
                        </Col>
                    </Row>
                    <CardFooter className={"text-right p-3"}>
                        <ShareLink outline linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose className={"d-inline-block"} />
                        <Button outline color={"secondary"} className={"mr-0 bin-icon d-inline-block outline"} onClick={confirmDeleteBoard} aria-label="Delete quiz"/>
                        {isSetAssignments && <Button className={"d-block w-100 assign-button"} color="secondary" onClick={toggleAssignModal}>
                            Assign{hasAssignedGroups && " / Unassign"}
                        </Button>}
                    </CardFooter>
                </CardBody>
            </Card>
        );
};
