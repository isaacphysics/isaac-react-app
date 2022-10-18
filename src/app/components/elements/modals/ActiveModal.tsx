import React from "react";
import {closeActiveModal, useActiveModal, useAppDispatch} from "../../../state";
import classNames from "classnames";
import {ActiveModalSpecification} from "../../../../IsaacAppTypes";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {ModalId, ModalTypeRegistry} from "./index";

interface BaseActiveModalProps {
    closeModal: () => void;
}
// Allows specifying a modal that connects to the `currentActiveModal` Redux state to ensure only one modal is open at
// a time.
//
// The `specification` parameter can depend on some data that is stored in the `currentActiveModal` state, which can be
// set by who/whatever activates this modal.
export function buildActiveModal<Id extends ModalId, Args = ModalTypeRegistry[Id]>(id: Id, componentName: string, specification: (props: Partial<Args> & BaseActiveModalProps) => ActiveModalSpecification): React.FC<Partial<Args>> {
    const ActiveModal: React.FC<Partial<Args>> = (props) => {
        const {data, closeModal, modalProps} = useActiveModal<Partial<Args>>(id);
        const {
            title,
            body: Body,
            buttons,
            centered,
            closeLabelOverride,
            size,
            noPadding,
            overflowVisible,
            closeAction
        } = specification({...props, ...data, closeModal});

        return <Modal {...modalProps} size={size ?? "lg"} centered={centered ?? true}>
            {<ModalHeader
                className={classNames({"h-title pb-5 mb-4": !!title}, {"position-absolute": !title})}
                style={title ? {} : {top: 0, width: "100%", height: 0, zIndex: 1}}
                close={<button className="close" onClick={() => {closeAction?.(); closeModal();}}>
                    {closeLabelOverride || "Close"}
                </button>}
            >
                {title}
            </ModalHeader>}
            <ModalBody className={classNames({"pt-0": !title, "pb-2 mx-4": !noPadding, "pb-0": noPadding, "overflow-visible": overflowVisible})}>
                {typeof Body === "function" ? <Body /> : Body}
            </ModalBody>
            {buttons && <ModalFooter className="mb-4 mx-2 align-self-center">
                {buttons}
            </ModalFooter>}
        </Modal>;
    };
    ActiveModal.displayName = componentName;
    return ActiveModal;
}

// TODO deprecate the below component completely
interface ActiveModalProps {
    activeModal?: ActiveModalSpecification | null;
}
export const ActiveModal = ({activeModal}: ActiveModalProps) => {
    const Body = activeModal && activeModal.body;
    const dispatch = useAppDispatch();

    const toggle = () => {
        dispatch(closeActiveModal());
    };

    return <Modal data-testid={"active-modal"} toggle={toggle} isOpen={true} size={(activeModal && activeModal.size) || "lg"} centered={activeModal?.centered}>
        {activeModal && <>
            {<ModalHeader
                    className={classNames({"h-title pb-5 mb-4": !!activeModal.title}, {"position-absolute": !activeModal.title})}
                    style={activeModal.title ? {} : {top: 0, width: "100%", height: 0, zIndex: 1}}
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
            </ModalHeader>}
            <ModalBody className={classNames({"pt-0": !activeModal.title, "pb-2 mx-4": !activeModal?.noPadding, "pb-0": activeModal?.noPadding, "overflow-visible": activeModal?.overflowVisible})}>
                {typeof Body === "function" ? <Body /> : Body}
            </ModalBody>
            {activeModal.buttons &&
                <ModalFooter className="mb-4 mx-2 align-self-center">
                    {activeModal.buttons}
                </ModalFooter>
            }
        </>}
    </Modal>;
};
