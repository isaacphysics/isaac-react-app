import React, { useMemo } from "react";
import {GameboardDTO, SeguePageDTO} from "../../../IsaacApiTypes";
import {RenderNothing} from "../elements/RenderNothing";
import {goToSupersededByQuestion, selectors, useAppDispatch, useAppSelector} from "../../state";
import {ISAAC_BOOKS_BY_TAG, isAQuestionLikeDoc, isStudent, isTutorOrAbove, PATHS, siteSpecific} from "../../services";
import { UncontrolledTooltip, Alert, Button, AlertProps } from "reactstrap";
import classNames from "classnames";
import { Link } from "react-router";

interface SupersededOrDeprecatedContentWarningProps extends AlertProps {
    gameboard?: GameboardDTO;
    hideFullDetails?: boolean;
}

// a warning banner to be used on / around gameboards that contain superseded or deprecated content
export const SupersededDeprecatedBoardContentWarning = (props: SupersededOrDeprecatedContentWarningProps) => {
    const {gameboard, hideFullDetails, ...rest} = props;
    const user = useAppSelector(selectors.user.orNull);

    const containsSuperseded = useMemo(() => {
        return Array.from(gameboard?.contents || []).some(content => content.supersededBy);
    }, [gameboard?.contents]);

    const containsDeprecated = useMemo(() => {
        return Array.from(gameboard?.contents || []).some(content => content.deprecated);
    }, [gameboard?.contents]);

    const isBookBoard = Object.keys(ISAAC_BOOKS_BY_TAG).some(tag => gameboard?.tags?.includes(tag));

    return (containsSuperseded || containsDeprecated) && isTutorOrAbove(user) && <Alert {...rest} color="warning" className={classNames("mt-2 d-flex", props.className)}>
        <i className="icon icon-warning icon-color-alert icon-sm me-3" />
        <div>
            <h5>{containsDeprecated ? "Deprecated content" : "Superseded content"}</h5>
            {!hideFullDetails && <p className="small mb-0">
                This assignment contains {containsDeprecated ? "content that we no longer maintain" : "content that has a newer version"}.{" "}
                {isBookBoard
                    ? <>If you want to set this work again, you should use the most up-to-date version from our book page.</>
                    : containsDeprecated
                        ? <>Please <Link to={`${PATHS.GAMEBOARD_BUILDER}?base=${gameboard?.id}`}>duplicate and edit</Link> this assignment to remove or replace the deprecated question(s).</>
                        : <>We recommend that you <Link to={`${PATHS.GAMEBOARD_BUILDER}?base=${gameboard?.id}`}>duplicate and edit</Link> this assignment to replace them with their newer version.</>
                }
            </p>}
        </div>
    </Alert>;
};

// a warning banner to be used above *standalone content* such as individual questions or concept pages. 
export function SupersededDeprecatedStandaloneContentWarning({doc}: {doc: SeguePageDTO}) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    const supersededBy = isAQuestionLikeDoc(doc) ? doc.supersededBy : undefined;

    // If doc.deprecated or supersededBy is falsey, render nothing
    if (!doc.deprecated && !supersededBy) {
        return RenderNothing;
    }

    // If doc is not deprecated and the user is a student we don't have anything to show them in this warning
    if (!doc.deprecated && isStudent(user)) {
        return RenderNothing;
    }

    const contentType = isAQuestionLikeDoc(doc) ? "question" : "page";

    // Tutors and teachers should see superseded/deprecated messages because they have to setting assignments etc. and
    // want up to date content.
    const teacherMessage = isTutorOrAbove(user) && <React.Fragment>
        <i id="superseded-help" className={classNames("ms-2 icon icon-info icon-inline", siteSpecific("icon-color-grey", "icon-color-black"))} />
        <UncontrolledTooltip placement="bottom" target="superseded-help">
            <div className="text-start">
                {supersededBy && <>
                    We periodically update questions into new formats.<br />
                    If this question appears on one of your <>{siteSpecific("question decks", "quizzes")}</>, you may want to update the <>{siteSpecific("question deck", "quiz")}</>.<br />
                    You can find help for this at Help and support &gt; Teacher Support &gt; Assigning Work.<br /><br />
                    Students will not see this message, but will see a smaller note at the bottom of the page.{doc.deprecated && <br/>}
                </>}
                {doc.deprecated && <>
                    As this {contentType} is unsupported, we do not recommend using it with your students.
                </>}
            </div>
        </UncontrolledTooltip>
    </React.Fragment>;

    // First check if question is deprecated, if so amalgamate deprecated and superseded messages
    return <Alert color="warning">
        {isTutorOrAbove(user) && <strong>
            Teacher note: {" "}
        </strong>}
        {doc.deprecated ? <div className="d-flex align-items-center">
            <span>
                This {contentType} is no longer supported, and may contain errors. {" "}
                {supersededBy && <>
                    It has been replaced by {" "} <Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                        this question
                    </Button>.
                </>} 
            </span>
            {teacherMessage}
        </div> :
        // If question is superseded but not deprecated
            (supersededBy && !isStudent(user) ? <div className="d-flex align-items-center">
                <span>
                    This question has been replaced by {" "}
                    <Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                        this question
                    </Button>.
                </span>
                {teacherMessage}
            </div> : RenderNothing)} {/* If neither deprecated or superseded, render nothing (although this should happen at the top of the component anyway) */}
    </Alert>;
}
