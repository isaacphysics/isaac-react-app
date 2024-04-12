import React from "react";
import * as AppTypes from "../../../../IsaacAppTypes";
import { closeActiveModal, useAppDispatch } from "../../../state";
import classNames from "classnames";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

interface ActiveModalProps {
  activeModal?: AppTypes.ActiveModal | null;
}

export const ActiveModal = ({ activeModal }: ActiveModalProps) => {
  const ActiveModalBody = activeModal?.body;
  const dispatch = useAppDispatch();

  const toggle = () => {
    dispatch(closeActiveModal());
  };

  return (
    <Modal
      data-testid={"active-modal"}
      toggle={toggle}
      isOpen={true}
      size={activeModal?.size ?? "lg"}
      centered={activeModal?.centered}
    >
      {activeModal && (
        <React.Fragment>
          {
            <ModalHeader
              data-testid={"modal-header"}
              className={classNames(
                { "h-title pb-5 mb-4": !!activeModal.title },
                { "position-absolute": !activeModal.title },
              )}
              style={activeModal.title ? {} : { top: 0, width: "100%", height: 0, zIndex: 1 }}
              close={
                activeModal.closeAction ? (
                  <button className="close" onClick={activeModal.closeAction}>
                    {activeModal?.closeLabelOverride ?? "Close"}
                  </button>
                ) : null
              }
            >
              {activeModal.title}
            </ModalHeader>
          }
          <ModalBody
            className={classNames({
              "pt-0": !activeModal.title,
              "pb-2 mx-4": !activeModal?.noPadding,
              "pb-0": activeModal?.noPadding,
              "overflow-visible": activeModal?.overflowVisible,
            })}
          >
            {typeof ActiveModalBody === "function" ? <ActiveModalBody /> : ActiveModalBody}
          </ModalBody>
          {activeModal.buttons && (
            <ModalFooter className="mb-4 mx-2 align-self-center">{activeModal.buttons}</ModalFooter>
          )}
        </React.Fragment>
      )}
    </Modal>
  );
};
