import React, {ReactNode, useEffect} from "react";
import * as AppTypes from "../../../../IsaacAppTypes";
import {closeActiveModal, selectors, useAppDispatch, useAppSelector} from "../../../state";
import classNames from "classnames";
import {isAda, siteSpecific} from "../../../services";
import {Modal, ModalHeader, ModalFooter, ModalBody, CloseButton} from "reactstrap";

interface ActiveModalProps <T> {
    activeModal?: AppTypes.ActiveModalWithState<T> | AppTypes.ActiveModalWithoutState | null;
}

export const ActiveModal = <T,>({activeModal}: ActiveModalProps<T>) => {
    const dispatch = useAppDispatch();
    const subject = useAppSelector(selectors.pageContext.subject);
    const state = isActiveModalWithState(activeModal) && activeModal.useInit ? activeModal.useInit() : null;

    const display = (prop: ((state: T) => ReactNode) | ReactNode): ReactNode => {
        return typeof prop === "function" ? prop(state!) : prop;
    };
    
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
                display(activeModal.header)
                :
                (activeModal.title || activeModal.closeAction) &&
                    <ModalHeader
                        data-testid={"modal-header"}
                        tag={siteSpecific(undefined, "h2")}
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
                {display(activeModal.body)}
            </ModalBody>

            {activeModal.buttons &&
                <ModalFooter className="mb-2 mx-2">
                    {display(activeModal.buttons)}
                </ModalFooter>
            }
        </React.Fragment>}
    </Modal>;
};

const isActiveModalWithState = <T,>(
    activeModal: AppTypes.ActiveModalWithState<T> | AppTypes.ActiveModalWithoutState | null | undefined
): activeModal is AppTypes.ActiveModalWithState<T> => {
    return activeModal !== null && activeModal !== undefined && 'useInit' in activeModal;
};