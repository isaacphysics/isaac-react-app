import React, {useEffect} from "react";
import * as AppTypes from "../../../../IsaacAppTypes";
import {closeActiveModal, selectors, useAppDispatch, useAppSelector} from "../../../state";
import classNames from "classnames";
import {isAda, isPhy, siteSpecific} from "../../../services";
import { Modal, ModalHeader, ModalFooter, ModalBody } from "reactstrap";

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModal | null;
}

export const ActiveModal = ({activeModal}: ActiveModalProps) => {
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
            {<ModalHeader
                data-testid={"modal-header"}
                tag={siteSpecific(undefined, "h2")}
                className={classNames({
                    "d-flex justify-content-between": activeModal.closeAction,
                    "h-title mb-4": !!activeModal.title && isAda,
                    "position-absolute": !activeModal.title,
                })}
                style={activeModal.title ? {} : {top: 0, width: "100%", height: 0, zIndex: 1}}
                close={
                    activeModal.closeAction ?
                        <button className={classNames("text-nowrap", {"btn-link bg-transparent": isAda, "close": isPhy, "mt-5": activeModal.title})} onClick={activeModal.closeAction}>
                            {activeModal?.closeLabelOverride || "Close"}
                        </button>
                        :
                        null
                }
            >
                {activeModal.title}
            </ModalHeader>}
            <ModalBody className={classNames(activeModal.bodyContainerClassName, "pb-2", {"mx-4": ["lg", "xl", undefined].includes(activeModal.size), "pt-0": !activeModal.title})}>
                {typeof activeModal?.body === "function" ? <activeModal.body /> : activeModal?.body}
            </ModalBody>
            {activeModal.buttons &&
                <ModalFooter className="mb-4 mx-2">
                    {activeModal.buttons}
                </ModalFooter>
            }
        </React.Fragment>}
    </Modal>;
};
