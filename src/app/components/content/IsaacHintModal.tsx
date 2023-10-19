import React, { useContext, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { IsaacContent } from "./IsaacContent";
import { ContentDTO } from "../../../IsaacApiTypes";
import { logAction, useAppDispatch } from "../../state";
import { ConfidenceContext } from "../../../IsaacAppTypes";

interface HintModalProps {
  label: string;
  title: string;
  body: ContentDTO;
  scrollable: boolean;
  questionPartId: string;
  hintIndex: number;
}
export const IsaacHintModal = (props: HintModalProps) => {
  const dispatch = useAppDispatch();
  const { questionPartId, hintIndex, label, title, body, ...restOfProps } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { recordConfidence } = useContext(ConfidenceContext);

  const toggle = () => {
    const isNowOpen = !isOpen;
    setIsOpen(isNowOpen);
    if (isNowOpen) {
      if (recordConfidence) {
        dispatch(
          logAction({
            type: "QUESTION_CONFIDENCE_HINT",
            questionPartId,
            hintIndex,
          }),
        );
      }
      dispatch(
        logAction({
          type: "VIEW_HINT",
          questionPartId,
          hintIndex,
        }),
      );
    }
  };

  const closeButton = (
    <button className="close" onClick={toggle}>
      Close
    </button>
  );

  return (
    <div>
      <Button color="link" size="sm" className="a-alt" onClick={toggle}>
        {label}
      </Button>

      <Modal isOpen={isOpen} toggle={toggle} size={"lg"} {...restOfProps}>
        <ModalHeader close={closeButton}>{title}</ModalHeader>
        <ModalBody>
          <IsaacContent doc={body} />
        </ModalBody>
      </Modal>
    </div>
  );
};
