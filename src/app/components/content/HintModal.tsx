import React, {useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {IsaacContent} from "./IsaacContent";
import {ContentDTO} from "../../../IsaacApiTypes";

interface HintModalProps {
    label: string;
    title: string;
    body: ContentDTO;
    scrollable: boolean;
}
export const HintModal = (props: HintModalProps) => {
    const {label, title, body, ...restOfProps} = props;
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const close = <button className="close" onClick={toggle}>Close</button>

    return <div>
        <Button color="link" size="sm" className="a-alt" onClick={toggle}>
            {label}
        </Button>

        <Modal isOpen={isOpen} toggle={toggle} {...restOfProps}>
            <ModalHeader close={close}>
                {title}
            </ModalHeader>
            <ModalBody>
                <IsaacContent doc={body} />
            </ModalBody>
            {/*<ModalFooter className="d-flex flex-wrap justify-content-center">*/}
            {/*    <Button color="primary" outline onClick={toggle}>*/}
            {/*        Do Something*/}
            {/*    </Button>{' '}*/}
            {/*    <Button color="danger" onClick={toggle}>*/}
            {/*        Cancel*/}
            {/*    </Button>*/}
            {/*</ModalFooter>*/}
        </Modal>
    </div>
};