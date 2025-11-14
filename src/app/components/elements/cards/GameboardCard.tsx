import React, { useMemo, useState } from "react";
import { GameboardDTO } from "../../../../IsaacApiTypes";
import { Row, Col, Button, Label, Collapse } from "reactstrap";
import { generateGameboardSubjectHexagons, isDefined, above, HUMAN_SUBJECTS, stageLabelMap, difficultyShortLabelMap, PATHS, tags, determineGameboardStagesAndDifficulties, determineGameboardSubjects, TAG_ID, useDeviceSize, Subject, isPhy } from "../../../services";
import { HexIcon } from "../svg/HexIcon";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Spacer } from "../Spacer";
import { ShareLink } from "../ShareLink";

export enum GameboardLinkLocation {
    // where on the card can the user click to navigate to the gameboard
    Card,
    Title
}

interface GameboardCardProps extends React.HTMLAttributes<HTMLElement> {
    gameboard?: GameboardDTO;
    linkLocation?: GameboardLinkLocation;
    onDelete?: () => void; // if this exists, a delete button will be shown calling this function
    setAssignmentsDetails?: {
        groupCount?: number;
        toggleAssignModal?: () => void;
    }
}

// any children passed into this component will be rendered in the card body
export const GameboardCard = (props: GameboardCardProps) => {
    const {gameboard, linkLocation, onDelete, children, setAssignmentsDetails, ...rest} = props;

    const [showMore, setShowMore] = useState(false);
    const boardStagesAndDifficulties = useMemo(() => determineGameboardStagesAndDifficulties(gameboard), [gameboard]);

    const deviceSize = useDeviceSize();

    const topics = tags.getTopicTags(Array.from((gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.alias ?? tag.title).sort();

    const boardSubjects = determineGameboardSubjects(gameboard);

    const isSetAssignments = isDefined(setAssignmentsDetails);

    const boardLink = gameboard && (isSetAssignments 
        ? `/assignment/${gameboard.id}`
        : `${PATHS.GAMEBOARD}#${gameboard.id}`
    );

    const card = <div className="px-3 py-2 flex-grow-1">
        <Row data-testid="my-assignment">
            <Col sm={isSetAssignments ? 8 : 12} md={8} className="d-flex flex-column align-items-start">
                <div className="d-flex align-items-center">
                    <div className="d-flex justify-content-center board-subject-hexagon-size me-4 my-2">
                        <div className="board-subject-hexagon-container justify-content-center">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                        </div>
                        <HexIcon icon="icon-question-deck" subject={boardSubjects[0] as Subject} className="assignment-hex ps-3"/>
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

                <Spacer/>
                
                {above[isSetAssignments ? 'sm' : 'md'](deviceSize) && <Button className="my-2 btn-underline" color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                    {showMore ? "Hide details" : "Show details"}
                </Button>}
            </Col>

            <Col sm={isSetAssignments ? 4 : 12} md={4} className="d-flex flex-column justify-content-between">
                <div className={classNames("d-flex flex-wrap justify-content-center justify-content-sm-end", 
                    {"justify-content-lg-center justify-content-xl-end column-gap-7 column-gap-md-4": !isSetAssignments},
                )}>
                    {!isSetAssignments 
                        ? <>
                            <Label className="d-block w-max-content text-center text-nowrap pt-3">
                                {isDefined(gameboard) &&<div className="board-percent-completed">{gameboard.percentageAttempted ?? 0}</div>}
                                Attempted
                            </Label>
                            <Label className="d-block w-max-content text-center text-nowrap pt-3">
                                {isDefined(gameboard) && <div className="board-percent-completed">{gameboard.percentageCorrect ?? 0}</div>}
                                Correct
                            </Label> 
                        </>
                        : <>
                            <Label className="d-block w-max-content text-center text-nowrap pt-3 pt-md-1" title="Number of groups assigned">
                                Assigned to
                                <div className="board-bubble-info">{setAssignmentsDetails?.groupCount ?? 0}</div>
                                group{setAssignmentsDetails?.groupCount !== 1 && "s"}
                            </Label>
                        </>
                    }
                </div>
                {isSetAssignments 
                    ? above['md'](deviceSize) && <div className="d-flex gap-3 align-items-center mb-2">
                        {isPhy && boardLink && <div className="card-share-link">
                            <ShareLink linkUrl={boardLink} reducedWidthLink clickAwayClose size="sm" buttonProps={{color: "keyline"}} />
                        </div>}
                        <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); setAssignmentsDetails.toggleAssignModal?.();}}>
                            Assign{!isDefined(setAssignmentsDetails.groupCount) || setAssignmentsDetails.groupCount > 0 && " / Unassign"}
                        </Button> 
                    </div>
                    : boardLink && <div className="d-flex justify-content-end card-share-link">
                        <ShareLink linkUrl={boardLink} gameboardId={gameboard.id} reducedWidthLink clickAwayClose />
                    </div>
                }

                {isSetAssignments && !above['md'](deviceSize) &&
                    <Button className="mb-2" color="keyline" onClick={(e) => {e.preventDefault(); setAssignmentsDetails.toggleAssignModal?.();}}>
                        Assign{!isDefined(setAssignmentsDetails.groupCount) || setAssignmentsDetails.groupCount > 0 && " / Unassign"}
                    </Button> 
                }

                {!above[isSetAssignments ? 'sm' : 'md'](deviceSize) && <Button className="my-2 btn-underline w-max-content" color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                    {showMore ? "Hide details" : "Show details"}
                </Button>}
            </Col>
        </Row>
        <Collapse isOpen={showMore} className="w-100">
            <Row>
                <Col xs={12} md={8} className="mt-sm-2">
                    <p className="mb-0"><strong>Questions:</strong> {gameboard?.contents?.length || "0"}</p>
                    {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                        <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                        {topics.join(", ")}
                    </p>}
                </Col>
                <Col xs={12} md={4} className="mt-sm-2">
                    {boardStagesAndDifficulties.length > 0 &&
                        <table className="w-100 mb-0">
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
                    }
                </Col>
            </Row>
        </Collapse>
    </div>;

    if (gameboard && linkLocation === GameboardLinkLocation.Card && boardLink) {
        return <Link {...rest} className={classNames("w-100 d-flex assignments-card mb-3", rest.className)} to={boardLink}>
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
