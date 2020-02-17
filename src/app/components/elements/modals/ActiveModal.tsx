import React from "react";
import * as RS from "reactstrap";
import * as AppTypes from "../../../../IsaacAppTypes";

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModal | null;
}

export const ActiveModal = ({activeModal}: ActiveModalProps) => {
    const ModalBody = activeModal && activeModal.body;
    return <RS.Modal isOpen={!!activeModal} size={(activeModal && activeModal.size) || "lg"}>
        {activeModal && <React.Fragment>
            <RS.ModalHeader
                className="h-title pb-5 mb-4"
                close={
                    activeModal.closeAction ?
                        <button className="close" onClick={activeModal.closeAction}>Close</button> : null
                }
            >
                {activeModal.title}
            </RS.ModalHeader>
            <RS.ModalBody className="px-1 pb-2 mx-4">
                <RS.Col>
                    {typeof ModalBody === "function" ? <ModalBody /> : ModalBody}
                </RS.Col>
            </RS.ModalBody>
            {activeModal.buttons &&
                <RS.ModalFooter className="mb-4 mx-2 align-self-center">
                    {activeModal.buttons}
                </RS.ModalFooter>
            }
        </React.Fragment>}
    </RS.Modal>
};
