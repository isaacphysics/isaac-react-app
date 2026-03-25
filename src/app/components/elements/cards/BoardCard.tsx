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
    stageLabelMap,
    useDeviceSize
} from "../../../services";
import {showErrorToast, unlinkUserFromGameboard, useAppDispatch} from "../../../state";
import {GameboardDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {Circle} from "../svg/Circle";
import classNames from "classnames";
import sortBy from "lodash/sortBy";
import {formatDate, getFriendlyDaysUntil} from "../DateString";
import {ShareLink} from "../ShareLink";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    Input,
    Row,
    Spinner,
    UncontrolledTooltip
} from "reactstrap";
import React from "react";
import {Link} from "react-router-dom";
import {BoardAssignee, Boards} from "../../../../IsaacAppTypes";
import indexOf from "lodash/indexOf";
import { GameboardCard, GameboardLinkLocation } from "./GameboardCard";
import { IconButton } from "../AffixButton";
import { SupersededDeprecatedBoardContentWarning } from "../../navigation/SupersededDeprecatedWarning";


interface HexagonGroupsButtonProps {
    toggleAssignModal: () => void;
    boardSubjects: string[];
    assignees: BoardAssignee[];
    id: string;
}
const HexagonGroupsButton = ({toggleAssignModal, boardSubjects, assignees, id}: HexagonGroupsButtonProps) =>
    // <div className="d-flex justify-content-center">
    //     <div className="board-subject-hexagon-container justify-content-center">
    //         {isDefined(assignment.gameboard) && ((assignment.gameboard.percentageCorrect === 100) ?
    //             <span className="board-subject-hexagon subject-complete"/> :
    //             <>
    //                 {generateGameboardSubjectHexagons(determineGameboardSubjects(assignment.gameboard))}
    //                 <div className="board-percent-completed">{assignment.gameboard.percentageCorrect ?? 0}</div>
    //             </>
    //         )}
    //     </div>
    // </div>
    <button onClick={toggleAssignModal} id={id} className="d-flex justify-content-center bg-white board-subject-hexagon-size">
        <div className="board-subject-hexagon-container justify-content-center">
            {generateGameboardSubjectHexagons(boardSubjects)}
            <span className="groups-assigned" title={"Number of groups assigned"}>
                <strong>{isDefined(assignees) ? assignees.length : <Spinner size="sm" />}</strong>{" "}
                group{(!assignees || assignees.length != 1) && "s"}
                {isDefined(assignees) &&
                <UncontrolledTooltip placement={"top"} target={"#" + id}>{assignees.length === 0 ?
                    "No groups have been assigned."
                    : (`${siteSpecific("Question deck", "Quiz")} assigned to: ` + assignees.map(g => g.groupName).join(", "))}
                </UncontrolledTooltip>}
            </span>
        </div>
    </button>;

interface InfoShapeProps {
    hexagonId: string;
    percentageDisplayed: number;
    boardSubjects: string[];
    assignees?: BoardAssignee[];
    toggleAssignModal?: () => void;
    isTable?: boolean;
    isSetAssignments?: boolean;
}

const PhyHexagon = ({hexagonId, percentageDisplayed, boardSubjects, assignees, toggleAssignModal, isTable}: InfoShapeProps) => {
    const isSetAssignments = isDefined(toggleAssignModal) && isDefined(assignees);

    return <div className={classNames("board-subject-hexagon-container", isTable ? "table-view" : "card-view")}>
        {
            isSetAssignments ? <HexagonGroupsButton toggleAssignModal={toggleAssignModal} boardSubjects={boardSubjects} assignees={assignees} id={hexagonId} />
                : <>
                    {generateGameboardSubjectHexagons(boardSubjects)}
                    <div className="board-percent-completed">{percentageDisplayed}</div>
                </>
        }
    </div>;
};

const AdaCircle = ({hexagonId, percentageDisplayed, assignees, toggleAssignModal}: InfoShapeProps) => {
    const isSetAssignments = isDefined(toggleAssignModal) && isDefined(assignees);

    return <svg className={"board-circle"} id={hexagonId} width={48} height={48}>
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
                : <>{percentageDisplayed}%</>
            }
        </foreignObject>
    </svg>;
};

type BoardCardProps = {
    user: RegisteredUserDTO;
    board: GameboardDTO;
    boards?: Boards | null;
    boardView: BoardViews;
    // Set assignments only
    assignees?: BoardAssignee[];
    toggleAssignModal?: () => void;
    // My gameboards only
    setSelectedBoards?: (selectedBoards: GameboardDTO[]) => void;
    selectedBoards?: GameboardDTO[];
};

export const BoardCard = ({user, board, boardView, assignees, toggleAssignModal, setSelectedBoards, selectedBoards}: BoardCardProps) => {
    // Decides whether we show the "Assign/Unassign" button, along with other "Set Assignments"-specific stuff
    const isSetAssignments = isDefined(toggleAssignModal) && isDefined(assignees);

    const hexagonId = (`board-hex-${board.id}`).replace(/[^a-z0-9-]+/gi, '');
    const boardLink = isSetAssignments ? `/assignment/${board.id}` : `${PATHS.GAMEBOARD}#${board.id}`;
    const hasAssignedGroups = assignees && assignees.length > 0;

    const dispatch = useAppDispatch();

    const deviceSize = useDeviceSize();

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
                alert(`Warning: You currently have groups assigned to this ${siteSpecific("question deck", "quiz")}. If you delete this your groups will still be assigned but you won't be able to unassign them or see the ${siteSpecific("question deck", "quiz")} on the ${siteSpecific("Set assignments", "Manage assignments")} page.`);
            } else {
                dispatch(showErrorToast(`${siteSpecific("Question Deck", "Quiz")} Deletion Not Allowed`, `You have groups assigned to this gameboard. To delete this ${siteSpecific("question deck", "quiz")}, you must unassign all groups.`));
                return;
            }
        }

        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title}));
        }
    }

    const boardSubjects = determineGameboardSubjects(board);
    const boardStagesAndDifficulties = determineGameboardStagesAndDifficulties(board);

    const basicCellClasses = `align-middle ${siteSpecific("text-center", "text-start")}`;

    const isTable = boardView === BoardViews.table;

    const infoShapeProps : Omit<InfoShapeProps, "percentageDisplayed"> = {
        hexagonId,
        boardSubjects,
        assignees,
        toggleAssignModal,
        isTable,
    };

    const stagesAndDifficultiesBorders = (i : number) => {
        return siteSpecific(`border-start-1 border-end-1 border-top-${i === 0 ? 0 : 1} border-bottom-${i === boardStagesAndDifficulties.length - 1 ? 0 : 1}`, "border-0");
    };

    const stagesAndDifficultiesTD = <td className={basicCellClasses + " p-0"} colSpan={2}>
        {boardStagesAndDifficulties.length > 0 && <table className="w-100 border-0">
            <tbody>
                {boardStagesAndDifficulties.map(([stage,difficulties], i) => {
                    return <tr key={stage} className={classNames({"border-0": i === 0, "border-start-0 border-end-0 border-bottom-0": i >= 1})}>
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
    </td>;

    return boardView == BoardViews.table ? (
        <tr className={siteSpecific("board-card", "")} data-testid={"gameboard-table-row"}>
            {isSetAssignments ? <>
                <td className={siteSpecific("", "align-middle text-center")}>
                    {siteSpecific(
                        <PhyHexagon {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />,
                        <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />
                    )}
                </td>
                <td colSpan={siteSpecific(1, isSetAssignments ? 2 : 4)} className="align-middle">
                    <a href={boardLink} className={isAda ? "fw--semi-bold" : ""}>{board.title}</a>
                    {isPhy && <span className="text-muted"><br/>Created by {<span data-testid={"owner"}>{formatBoardOwner(user, board)}</span>}</span>}
                    <br/>
                    {isSetAssignments && <SupersededDeprecatedBoardContentWarning gameboard={board} />}
                </td>
                {stagesAndDifficultiesTD}
                {isAda && <td className={basicCellClasses} data-testid={"owner"}>{formatBoardOwner(user, board)}</td>}
                <td className={basicCellClasses} data-testid={"last-visited"}>{formatDate(board.lastVisited)}</td>
                <td className={"align-middle text-center"}>
                    <Button className="set-assignments-button" color={siteSpecific("tertiary", "solid")} size="sm" onClick={toggleAssignModal}>
                        Assign{hasAssignedGroups && "\u00a0/ Unassign"}
                    </Button>
                </td>
                {isAda && <td className={"align-middle text-center"}>
                    <div className="table-share-link">
                        <ShareLink linkUrl={boardLink} gameboardId={board.id} innerClassName="btn-keyline" outline clickAwayClose />
                    </div>
                </td>}
                {isAda && <td className={"align-middle text-center"}>
                    <IconButton icon={{name: "icon-bin", size: "sm"}} color="keyline" className="action-button" aria-label="Delete quiz" title="Delete quiz" onClick={confirmDeleteBoard}/>
                </td>}
            </> 
                : 
                <>
                    <td colSpan={siteSpecific(1, isSetAssignments ? 2 : 4)} className="align-middle">
                        <a href={boardLink} className={isAda ? "fw--semi-bold" : ""}>{board.title}</a>
                        {isPhy && <span className="text-muted"><br/>Created by {<span data-testid={"owner"}>{formatBoardOwner(user, board)}</span>}</span>}
                    </td>
                    {stagesAndDifficultiesTD}
                    {isAda && <td className={basicCellClasses} data-testid={"owner"}>{formatBoardOwner(user, board)}</td>}
                    <td className="align-middle text-center">{formatDate(board.creationDate)}</td>
                    <td className={siteSpecific("align-content-center", "align-middle text-center")}>
                        {siteSpecific(
                            <PhyHexagon {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />,
                            <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />
                        )}
                    </td>
                    <td className={siteSpecific("align-content-center", "align-middle text-center")}>
                        {siteSpecific(
                            <PhyHexagon {...infoShapeProps} percentageDisplayed={board.percentageCorrect ?? 0} />,
                            <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageCorrect ?? 0} />
                        )}
                    </td>
                    {isAda && <td className={"align-middle text-center"}>
                        <div className="table-share-link">
                            <ShareLink linkUrl={boardLink} gameboardId={board.id} innerClassName="btn-keyline" outline clickAwayClose />
                        </div>
                    </td>}
                    {siteSpecific(<td className={"text-center align-middle"}>
                        <IconButton icon={{name: "icon-bin", size: "sm", color: siteSpecific("tertiary", "primary")}} color={siteSpecific("", "keyline")} className="action-button" aria-label="Delete quiz" title="Delete quiz" onClick={confirmDeleteBoard}/>
                    </td>,
                    <td className={"text-center align-middle overflow-hidden"}>
                        <Input
                            id={`board-delete-${board.id}`}
                            type="checkbox"
                            color="secondary"
                            className={"isaac-checkbox me-n2"}
                            checked={board && selectedBoards?.some(e => e.id === board.id)}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                board && updateBoardSelection(board, event.target.checked)
                            } aria-label="Delete quiz"
                        />
                    </td>)}
                </>}
        </tr>)
        :
        siteSpecific(
            <GameboardCard gameboard={board} linkLocation={GameboardLinkLocation.Card} onDelete={confirmDeleteBoard} data-testid="gameboard-card"
                {...(isSetAssignments ? {'setAssignmentsDetails': {toggleAssignModal, groupCount: assignees.length}} : {})}>
                <Row>
                    <Col>
                        {isDefined(board.creationDate) && <p className="mb-0" data-testid={"created-date"}>
                            Created <strong>{getFriendlyDaysUntil(board.creationDate)}</strong>
                        </p>}
                        {isDefined(board.lastVisited) && <p className="mb-0" data-testid={"last-visited"}>
                            Last visited <strong>{getFriendlyDaysUntil(board.lastVisited)}</strong>
                        </p>}
                        {isSetAssignments && <SupersededDeprecatedBoardContentWarning gameboard={board} />}
                    </Col>
                </Row>
            </GameboardCard>,
            <Card className={"board-card"} data-testid={"gameboard-card"}>
                <CardBody className="pb-7 pt-4">
                    <Row className={"mb-2"}>
                        <Col xs={8} sm={7} md={8}>
                            <h4><Link className={"d-inline"} to={boardLink}>{board.title}</Link></h4>
                            <span data-testid={"owner"}><b>By</b>: {formatBoardOwner(user, board)}</span><br/>
                            <span data-testid={"created-date"}><b>Created</b>: {formatDate(board.creationDate)}</span><br/>
                            <span data-testid={"last-visited"}><b>Last visited</b>: {formatDate(board.lastVisited)}</span><br/>
                        </Col>
                        {isSetAssignments ? (
                            <Col>
                                {/* number of groups */}
                                <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />
                            </Col>
                        ) : (
                            deviceSize === "sm" ? <Col sm={5} className="ps-0 d-flex flex-sm-row">
                                <Col xs={12} sm={6} md={12} className="d-flex flex-column p-0 align-items-center">
                                    <span>Attempted</span>
                                    <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />
                                </Col>
                                <Col xs={12} sm={6} md={12} className="d-flex flex-column p-0 align-items-center">
                                    <span className="p-0">Correct</span>
                                    <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageCorrect ?? 0} />
                                </Col>
                            </Col> :
                                <Col xs={4} className="ps-0 d-flex flex-column justify-content-start">
                                    <Row className="p-0 align-items-center">
                                        <Col className="d-flex flex-column align-items-center">
                                            <span>Attempted</span>
                                            <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageAttempted ?? 0} />
                                        </Col>
                                    </Row>
                                    <Row className="p-0 align-items-center">
                                        <Col className="d-flex flex-column align-items-center">
                                            <span className="pt-2">Correct</span>
                                            <AdaCircle {...infoShapeProps} percentageDisplayed={board.percentageCorrect ?? 0} />
                                        </Col>
                                    </Row>
                                </Col>
                        )}
                        <Col className="pt-3">
                            <b>Stages and difficulties</b>:
                            <br/> 
                            <p>
                                {boardStagesAndDifficulties.map(([stage,difficulties], _) =>
                                    `${stageLabelMap[stage]} (${sortBy(difficulties, d => indexOf(Object.keys(difficultyShortLabelMap), d)).map(d => difficultyShortLabelMap[d]).join(", ")})`
                                ).join(", ") || "-"}
                            </p>
                            <br/>
                        </Col>
                    </Row>
                    <CardFooter className={"text-end p-3 mt-3"}>
                        <ShareLink linkUrl={boardLink} gameboardId={board.id} reducedWidthLink clickAwayClose className="d-inline-block me-2" innerClassName="btn-keyline" outline />
                        <IconButton icon={{name: "icon-bin", size: "sm"}} color="keyline" className="action-button" aria-label="Delete quiz" title="Delete quiz" onClick={confirmDeleteBoard}/>
                        {isSetAssignments && <Button className={"d-block w-100 assign-button"} color="solid" onClick={toggleAssignModal}>
                            Assign{hasAssignedGroups && " / Unassign"}
                        </Button>}
                    </CardFooter>
                </CardBody>
            </Card>
        );
};
