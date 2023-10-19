import { ListGroup, ListGroupItem } from "reactstrap";
import { IsaacHintModal } from "./IsaacHintModal";
import React from "react";
import { ContentDTO } from "../../../IsaacApiTypes";
import { IsaacContent } from "./IsaacContent";
import { AppState, useAppSelector } from "../../state";

const PrintOnlyHints = ({ hints }: { hints?: ContentDTO[] }) => {
  const printHints = useAppSelector((state: AppState) => state?.printingSettings?.hintsEnabled);
  return (
    <React.Fragment>
      {printHints &&
        hints?.map((hint, index) => (
          <div key={index} className={"question-hints pl-0 py-1 only-print"}>
            <h4>{`Hint ${index + 1}`}</h4>
            <IsaacContent doc={hint} />
          </div>
        ))}
    </React.Fragment>
  );
};

interface HintsProps {
  hints?: ContentDTO[];
  questionPartId: string;
}
export const IsaacLinkHints = ({ hints, questionPartId }: HintsProps) => {
  return (
    <div>
      <ListGroup className="question-hints mb-1 pt-3 mt-3 no-print">
        {hints?.map((hint, index) => (
          <ListGroupItem key={index} className="pl-0 py-1">
            <IsaacHintModal
              questionPartId={questionPartId}
              hintIndex={index}
              label={`Hint ${index + 1}`}
              title={hint.title || `Hint ${index + 1}`}
              body={hint}
              scrollable
            />
          </ListGroupItem>
        ))}
      </ListGroup>
      <PrintOnlyHints hints={hints} />
    </div>
  );
};
