import React, {useEffect} from "react";
import * as AppTypes from "../../../../IsaacAppTypes";
import {closeActiveModal, selectors, useAppDispatch, useAppSelector} from "../../../state";
import classNames from "classnames";
import {isAda, siteSpecific} from "../../../services";
import {Modal, ModalHeader, ModalFooter, ModalBody, CloseButton} from "reactstrap";

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModalWithoutState | null;
}

export const ActiveModal = ({activeModal}: ActiveModalProps): React.ReactElement<typeof Modal> => {
    const dispatch = useAppDispatch();
    const subject = useAppSelector(selectors.pageContext.subject);
    
    const toggle = () => {
        dispatch(closeActiveModal());
    };

    useEffect(() => {
        window.addEventListener("popstate", toggle);
        return () => {
            window.removeEventListener("popstate", toggle);
        };
    });

    return <Modal data-testid={"active-modal"} toggle={toggle} isOpen={true} size={activeModal?.size ?? "lg"} centered={activeModal?.centered} data-bs-theme={subject ?? "neutral"}>
        {activeModal && <React.Fragment>
            {activeModal.header ?
                activeModal.header
                :
                (activeModal.title || activeModal.closeAction) &&
                    <ModalHeader
                        data-testid={"modal-header"}
                        tag={siteSpecific(undefined, "h3")}
                        className={classNames({
                            "d-flex justify-content-between": activeModal.closeAction,
                            "h-title": !!activeModal.title && isAda,
                            "position-absolute": !activeModal.title,
                        })}
                        style={activeModal.title ? {} : {top: 0, width: "100%", height: 0, zIndex: 1}}
                        close={
                            activeModal.closeAction ?
                                siteSpecific(
                                    <button data-testid={"active-modal-close"} className="text-nowrap close" onClick={activeModal.closeAction}>
                                        {activeModal?.closeLabelOverride || "Close"}
                                    </button>,
                                    <CloseButton data-testid={"active-modal-close"} onClick={activeModal.closeAction}/>
                                )
                                :
                                null
                        }
                    >
                        {activeModal.title}
                    </ModalHeader>
            }

            <ModalBody className={classNames(activeModal.bodyContainerClassName, {"mx-4": ["lg", "xl", undefined].includes(activeModal.size), "pt-0": !activeModal.title})}>
                {typeof activeModal?.body === "function" ? <activeModal.body /> : activeModal?.body}
            </ModalBody>

            {activeModal.buttons &&
                <ModalFooter className="mb-2 mx-2">
                    {activeModal.buttons}
                </ModalFooter>
            }
        </React.Fragment>}
    </Modal>;
};
