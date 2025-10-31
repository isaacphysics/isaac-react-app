import React, {useEffect, useState} from "react";
import * as AppTypes from "../../../../IsaacAppTypes";
import {closeActiveModal, selectors, useAppDispatch, useAppSelector} from "../../../state";
import classNames from "classnames";
import {isAda, siteSpecific} from "../../../services";
import {Modal, ModalHeader, ModalFooter, ModalBody, CloseButton, Button} from "reactstrap";

interface ActiveModalProps {
    activeModal?: AppTypes.ActiveModalProps | null;
}

export const ActiveModal = ({activeModal}: ActiveModalProps): React.ReactElement<typeof Modal> => {
    const dispatch = useAppDispatch();
    const subject = useAppSelector(selectors.pageContext.subject);
    const [page, setPage] = useState(0);
    const totalPages = activeModal && Symbol.iterator in Object(activeModal.body) ? Array.from(activeModal.body as Iterable<React.ReactNode>).length : 1;

    const pageIndicator = totalPages > 1 && <div role="region" aria-label={`Modal page indicator (page ${page + 1} of ${totalPages})`} className="w-100 text-center mb-3 mt-n3 fs-2">
        {Array.from({length: totalPages}, (_, idx) => (
            <span key={idx} className={classNames({"text-body-tertiary": page !== idx})} aria-hidden>⋅</span>
        ))}
    </div>;
    
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
            <div className="d-flex gap-2">
                {activeModal.header 
                    ? activeModal.header
                    : (activeModal.title || activeModal.closeAction) && <ModalHeader
                        data-testid={"modal-header"}
                        tag={siteSpecific(undefined, "h3")}
                        className={classNames("w-100", {
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
            </div>

            <ModalBody className={classNames(activeModal.bodyContainerClassName, {"mx-4": ["lg", "xl", undefined].includes(activeModal.size), "pt-0": !activeModal.title})}>
                {totalPages > 1
                    ? <>{Array.from(activeModal.body as Iterable<React.ReactNode>)[page]}</>
                    : typeof activeModal.body === "function" ? <activeModal.body /> : activeModal.body
                }
            </ModalBody>

            {activeModal.buttons &&
                <ModalFooter className="mb-2 mx-2 justify-content-center">
                    {page < totalPages - 1
                        ? <Button color="primary" onClick={() => setPage(p => p + 1)}>Next</Button>
                        : activeModal.buttons
                    }
                </ModalFooter>
            }

            {pageIndicator}
        </React.Fragment>}
    </Modal>;
};
