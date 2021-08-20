import React, {useEffect, useRef, useState} from "react";
import * as RS from "reactstrap";
import * as AppTypes from "../../../../IsaacAppTypes";
import {closeActiveModal} from "../../../state/actions";
import {useDispatch} from "react-redux";

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModal | null;
}

export const ActiveModal = ({activeModal}: ActiveModalProps) => {
    const ModalBody = activeModal && activeModal.body;
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(true);
    const modalRef = useRef(null);

    const toggle = () => {
        const isNowOpen = !isOpen;
        setIsOpen(isNowOpen);
    };

    useEffect(() => {
        if (!isOpen) {
            dispatch(closeActiveModal());
        }
    }, [dispatch, isOpen]);

    // Override default modal handing of escape key and backdrop click to
    // make sure scrollbar is unlocked on close.
    // TODO this feels like a patch on top of an issue with how 'toggle' works
    //  since that is what gets called in the Modal component.
    useEffect(() => {
        if (modalRef && modalRef.current) {
            // @ts-ignore
            modalRef.current.handleEscape = (e) => {
                // @ts-ignore
                const backdrop = modalRef.current._dialog ? modalRef.current._dialog.parentNode : null;
                if (backdrop && e.target === backdrop) {
                    dispatch(closeActiveModal());
                }
            }
            // @ts-ignore
            modalRef.current.handleBackdropClick = (e) => {
                // @ts-ignore
                const backdrop = modalRef.current._dialog ? modalRef.current._dialog.parentNode : null;
                if (backdrop && e.target === backdrop) {
                    dispatch(closeActiveModal());
                }
            };
        }
    });

    return <RS.Modal ref={modalRef} toggle={toggle} isOpen={isOpen} size={(activeModal && activeModal.size) || "lg"}>
        {activeModal && <React.Fragment>
            <RS.ModalHeader
                className="h-title pb-5 mb-4"
                close={
                    activeModal.closeAction ?
                        <button className="close" onClick={activeModal.closeAction}>
                            {activeModal?.closeLabelOverride || "Close"}
                        </button>
                        :
                        null
                }
            >
                {activeModal.title}
            </RS.ModalHeader>
            <RS.ModalBody className={`pb-2 mx-4 ${activeModal?.overflowVisible ? "overflow-visible" : ""}`}>
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
