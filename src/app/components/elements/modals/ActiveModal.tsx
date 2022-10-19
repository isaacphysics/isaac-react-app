import React from "react";
import {AppDispatch, closeActiveModal, useActiveModal, useAppDispatch} from "../../../state";
import classNames from "classnames";
import {ActiveModalSpecification} from "../../../../IsaacAppTypes";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {ModalId, ModalTypeRegistry} from "./index";
import {ModalProps} from "reactstrap/es/Modal";

interface IsaacModalProps {
    options?: Omit<ActiveModalSpecification, "body" | "title">,
    modalProps: ModalProps,
    closeModal: () => void;
    title?: string
}
export const IsaacModal = ({options, modalProps, children, closeModal, title}: React.PropsWithChildren<IsaacModalProps>) => {
    const {
        buttons,
        centered,
        closeLabelOverride,
        size,
        noPadding,
        overflowVisible,
        closeAction
    } = options ?? {};

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
            {children}
        </ModalBody>
        {buttons && <ModalFooter className="mb-4 mx-2 align-self-center">
            {buttons}
        </ModalFooter>}
    </Modal>;
}

export interface BaseActiveModalSpecificationArgs {
    closeModal: () => void;
    dispatch: AppDispatch;
}
export interface BaseActiveModalProps {
    uId?: string | number;
}
// Allows specifying a modal that connects to the `currentActiveModal` Redux state to ensure only one modal is open at
// a time.
//
// The `specification` parameter can depend on some data that is stored in the `currentActiveModal` state, which can be
// set by who/whatever activates this modal. We assume that every time `specification` is called, it will have all the
// required arguments, passed either by the `data` parameter of `openActiveModal`, or in the components props.
export function buildActiveModal<Id extends ModalId, Args extends {} = ModalTypeRegistry[Id]>(id: Id, componentName: string, specification: (props: Args & BaseActiveModalSpecificationArgs) => ActiveModalSpecification): React.FC<Partial<Args> & BaseActiveModalProps> {
    const ActiveModal: React.FC<Partial<Args> & BaseActiveModalProps> = (props) => {
        const {data, closeModal, modalProps} = useActiveModal<Partial<Args>>(props.uId ? `${id}-${props.uId}` : id);
        const dispatch = useAppDispatch();
        const {
            body: Body,
            title,
            ...rest
        } = specification({...props, ...data, closeModal, dispatch} as Args & BaseActiveModalSpecificationArgs);

        return <IsaacModal title={title} options={rest} modalProps={modalProps} closeModal={closeModal}>
            {typeof Body === "function" ? <Body /> : Body}
        </IsaacModal>;
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
