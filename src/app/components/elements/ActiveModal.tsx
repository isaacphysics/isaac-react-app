import React from "react";
import * as RS from "reactstrap";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import * as AppTypes from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => ({
    activeModal: state && state.activeModal
});

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModal | null;
}

const ActiveModalComponent = ({activeModal}: ActiveModalProps) => (
    <RS.Modal isOpen={!!activeModal}>
        {activeModal && <React.Fragment>
            <RS.ModalHeader
                className="h-title pb-5 mb-4"
                close={<button className="close" onClick={activeModal.closeAction}>Close</button>}
            >
                {activeModal.title}
            </RS.ModalHeader>
            <RS.ModalBody className="px-0 pb-2 mx-4">
                {activeModal.body}
            </RS.ModalBody>
            <RS.ModalFooter className="mb-4 align-self-center">
                {activeModal.buttons}
            </RS.ModalFooter>
        </React.Fragment>}
    </RS.Modal>
);

export const ActiveModal = connect(stateToProps)(ActiveModalComponent);
