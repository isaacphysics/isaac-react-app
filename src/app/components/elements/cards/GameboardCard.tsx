import React, { useMemo, useState } from "react";
import { GameboardDTO } from "../../../../IsaacApiTypes";
import { Row, Col, Button, Label, Collapse } from "reactstrap";
import { Subject } from "../../../../IsaacAppTypes";
import { generateGameboardSubjectHexagons, isDefined, above, HUMAN_SUBJECTS, stageLabelMap, difficultyShortLabelMap, PATHS, tags, determineGameboardStagesAndDifficulties, determineGameboardSubjects, TAG_ID, useDeviceSize } from "../../../services";
import { PhyHexIcon } from "../svg/PhyHexIcon";
import { Link } from "react-router-dom";
import classNames from "classnames";

export enum GameboardLinkLocation {
    // where on the card can the user click to navigate to the gameboard
    Card,
    Title
}

interface GameboardCardProps extends React.HTMLAttributes<HTMLElement> {
    gameboard?: GameboardDTO;
    linkLocation?: GameboardLinkLocation;
    onDelete?: () => void; // if this exists, a delete button will be shown calling this function
}

// any children passed into this component will be rendered in the card body
export const GameboardCard = (props: GameboardCardProps) => {
    const {gameboard, linkLocation, onDelete, children, ...rest} = props;

    const [showMore, setShowMore] = useState(false);
    const boardStagesAndDifficulties = useMemo(() => determineGameboardStagesAndDifficulties(gameboard), [gameboard]);

    const deviceSize = useDeviceSize();

    const topics = tags.getTopicTags(Array.from((gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.title).sort();

    const boardSubjects = determineGameboardSubjects(gameboard);

    const card = <div className="px-3 py-2 flex-grow-1">
        <Row data-testid="my-assignment">
            <Col xs={8}>
                <div className="d-flex align-items-center">
                    <div className="d-flex justify-content-center board-subject-hexagon-size me-4 my-2">
                        <div className="board-subject-hexagon-container justify-content-center">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                        </div>
                        <PhyHexIcon icon="page-icon-question-pack" subject={boardSubjects[0] as Subject} className="assignment-hex ps-3"/>
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                        <h4 className="text-break m-0">
                            {isDefined(gameboard) && (
                                linkLocation === GameboardLinkLocation.Title
                                    ? <Link to={`${PATHS.GAMEBOARD}#${gameboard.id}`}>{gameboard.title}</Link>
                                    : gameboard.title
                            )}
                        </h4>
                        {above['sm'](deviceSize) && boardSubjects.length > 0 && <div className="d-flex align-items-center mb-2">
                            {boardSubjects.map((subject) => <span key={subject} className="badge rounded-pill bg-theme me-1" data-bs-theme={subject}>{HUMAN_SUBJECTS[subject]}</span>)}
                        </div>}
                    </div>
                </div>

                {children}
                
                <Button className="my-2 btn-underline" color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                    {showMore ? "Hide details" : "Show details"}
                </Button>
            </Col>

            <Col xs={4}>
                <div className="d-flex flex-wrap justify-content-center justify-content-md-end justify-content-lg-center justify-content-xl-end column-gap-4">
                    <Label className="d-block w-max-content text-center text-nowrap pt-3">
                        {isDefined(gameboard) && ((gameboard.percentageAttempted === 100) ?
                            <span className="board-subject-hexagon subject-complete"/> :
                            <div className="board-percent-completed">{gameboard.percentageAttempted ?? 0}</div>
                        )}
                        Attempted
                    </Label>
                    <Label className="d-block w-max-content text-center text-nowrap pt-3">
                        {isDefined(gameboard) && ((gameboard.percentageCorrect === 100) ?
                            <span className="board-subject-hexagon subject-complete"/> :
                            <div className="board-percent-completed">{gameboard.percentageCorrect ?? 0}</div>
                        )}
                        Correct
                    </Label>
                </div>
            </Col>
        </Row>
        <Collapse isOpen={showMore} className="w-100">
            <Row>
                {/* {!above['md'](deviceSize) && <Col xs={12}>
                    {isDefined(assignment.groupName) &&
                        <p className="mb-0"><strong>Group:</strong> {assignment.groupName}</p>
                    }
                    {isDefined(assignment.assignerSummary) &&
                        <p className="mb-0"><strong>By:</strong> {extractTeacherName(assignment.assignerSummary)}</p>
                    }
                </Col>} */}

                <Col xs={12} md={8} className="mt-sm-2">
                    <p className="mb-0"><strong>Questions:</strong> {gameboard?.contents?.length || "0"}</p>
                    {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                        <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                        {topics.join(", ")}
                    </p>}
                </Col>
                <Col xs={12} md={4} className="mt-sm-2">
                    {boardStagesAndDifficulties.length > 0 && <p className="mb-0">
                        <table className="w-100">
                            <thead>
                                <tr>
                                    <th className="w-50">
                                        {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}:`}
                                    </th>
                                    <th className="w-50">
                                        {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                    <td className="w-50 align-baseline">
                                        {stageLabelMap[stage]}:
                                    </td>
                                    <td className="w-50 ps-1">
                                        {difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </p>}
                </Col>
            </Row>
        </Collapse>
    </div>;

    if (gameboard && linkLocation === GameboardLinkLocation.Card) {
        return <Link {...rest} className={classNames("w-100 d-flex assignments-card mb-3", rest.className)} to={`${PATHS.GAMEBOARD}#${gameboard.id}`}>
            {card}
            {onDelete && <Button className="delete-button" color="solid" onClick={(e) => {onDelete(); e.preventDefault();}}>
                <img src="/assets/phy/icons/bin-black.svg" alt="Delete board"/>
            </Button>}
        </Link>;
    } else {
        return <div className={classNames("w-100 d-flex assignments-card mb-3", rest.className)}>
            {card}
            {onDelete && <Button className="delete-button" color="solid" onClick={(e) => {onDelete(); e.preventDefault();}}>bin</Button>}
        </div>;
    }
};
