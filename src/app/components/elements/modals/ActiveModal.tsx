import React from "react";
import * as RS from "reactstrap";
import {connect} from "react-redux";
import {AppState} from "../../../state/reducers";
import * as AppTypes from "../../../../IsaacAppTypes";

const stateToProps = (state: AppState) => ({
    activeModal: state && state.activeModal
});

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModal | null;
}

const ActiveModalComponent = ({activeModal}: ActiveModalProps) => {
    const ModalBody = activeModal && activeModal.body;
    return <RS.Modal isOpen={!!activeModal} size={"lg"}>
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
            <RS.ModalBody className="px-0 pb-2 mx-4">
                {typeof ModalBody === "function" ? <ModalBody /> : ModalBody}
            </RS.ModalBody>
            {activeModal.buttons &&
                <RS.ModalFooter className="mb-4 mx-2 align-self-center">
                    {activeModal.buttons}
                </RS.ModalFooter>
            }
        </React.Fragment>}
    </RS.Modal>
};

export const ActiveModal = connect(stateToProps)(ActiveModalComponent);
