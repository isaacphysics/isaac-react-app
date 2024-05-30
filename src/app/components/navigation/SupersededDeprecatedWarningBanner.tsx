import React from "react";
import { ContentDTO } from "../../../IsaacApiTypes";
import { RenderNothing } from "../elements/RenderNothing";
import { goToSupersededByQuestion, selectors, useAppDispatch, useAppSelector } from "../../state";
import { isAQuestionLikeDoc, isStudent, isTutorOrAbove } from "../../services";
import { Alert, Button, UncontrolledTooltip } from "reactstrap";

export function SupersededDeprecatedWarningBanner({ doc }: { doc: ContentDTO }) {
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
  const teacherMessage = isTutorOrAbove(user) && (
    <React.Fragment>
      <span id="superseded-help" className="icon-help" />
      <UncontrolledTooltip placement="bottom" target="superseded-help">
        <div className="text-left">
          {supersededBy && (
            <>
              We periodically update questions into new formats.
              <br />
              If this question appears on one of your gameboards, you may want to update the gameboard.
              <br />
              You can find help for this at Help and support &gt; Teacher Support &gt; Assigning Work.
              <br />
              <br />
              Students will not see this message, but will see a smaller note at the bottom of the page.
              {doc.deprecated && <br />}
            </>
          )}
          {doc.deprecated && (
            <>As this {contentType} is unsupported, we do not recommend using it with your students.</>
          )}
        </div>
      </UncontrolledTooltip>
    </React.Fragment>
  );

  // First check if question is deprecated, if so amalgamate deprecated and superseded messages
  return (
    <Alert color="warning">
      {isTutorOrAbove(user) && <strong>Teacher note: </strong>}
      {doc.deprecated ? (
        <>
          This {contentType} is no longer supported, and may contain errors.{" "}
          {supersededBy && (
            <>
              It has been replaced by{" "}
              <Button
                role="link"
                color="link"
                className="align-baseline"
                onClick={() => dispatch(goToSupersededByQuestion(doc))}
              >
                this question
              </Button>
              .
            </>
          )}{" "}
          {teacherMessage}
        </>
      ) : // If question is superseded but not deprecated
      supersededBy && !isStudent(user) ? (
        <>
          This question has been replaced by{" "}
          <Button
            role="link"
            color="link"
            className="align-baseline"
            onClick={() => dispatch(goToSupersededByQuestion(doc))}
          >
            this question
          </Button>
          . {teacherMessage}
        </>
      ) : (
        // If neither deprecated or superseded, render nothing (although this should happen at the top of the component anyway)
        RenderNothing
      )}
    </Alert>
  );
}
