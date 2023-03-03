import {Button, Card, CardBody, CardFooter, Col, Row} from "reactstrap";
import {
    determineGameboardStagesAndDifficulties,
    difficultyShortLabelMap,
    formatBoardOwner,
    PATHS,
    stageLabelMap
} from "../../services";
import {formatDate} from "./DateString";
import {Link} from "react-router-dom";
import {ShareLink} from "./ShareLink";
import React from "react";
import {GameboardDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import {unlinkUserFromGameboard, useAppDispatch} from "../../state";
import {Circle} from "./svg/Circle";
import {sortBy} from "lodash";
import {Util} from "leaflet";
import indexOf = Util.indexOf;

export const GameboardCard = ({user, board}: {user: RegisteredUserDTO; board: GameboardDTO}) => {
    const dispatch = useAppDispatch();

    const boardLink = `${PATHS.GAMEBOARD}#${board.id}`;

    function confirmCardDeleteBoard() {
        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title}));
        }
    }
    const boardStagesAndDifficulties = determineGameboardStagesAndDifficulties(board);

    return <Card className={"board-card"} data-testid={"my-gameboard-card"}>
        <CardBody className="pb-4 pt-4">
            <Row className={"mb-2"}>
                <Col>
                    <svg width={48} height={48} className={"float-left mr-3"}>
                        <Circle radius={24} properties={{fill: "#000"}}/>
                        <foreignObject className="board-percent-completed" x={0} y={0} width={48} height={48}>
                            {board.percentageCompleted}%
                        </foreignObject>
                    </svg>
                    <h4><Link className={"d-inline"} to={boardLink}>{board.title}</Link></h4>
                    <span>By: {formatBoardOwner(user, board)}</span>
                </Col>
            </Row>
            <Row className={"mb-0"}>
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
                <Button outline color={"secondary"} className={"mr-0 bin-icon d-inline-block outline"} onClick={confirmCardDeleteBoard} aria-label="Delete gameboard"/>
            </CardFooter>
        </CardBody>
    </Card>
};
