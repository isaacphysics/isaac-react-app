import React, {useState} from "react";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {IsaacContent} from "./IsaacContent";
import {ContentDTO} from "../../../IsaacApiTypes";

interface HintModalProps {
    label: string;
    title: string;
    body: ContentDTO;
    scrollable: boolean;
}
export const IsaacHintModal = (props: HintModalProps) => {
    const {label, title, body, ...restOfProps} = props;
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const closeButton = <button className="close" onClick={toggle}>Close</button>;

    return <div>
        <Button color="link" size="sm" className="a-alt" onClick={toggle}>
            {label}
        </Button>

        <Modal isOpen={isOpen} toggle={toggle} {...restOfProps}>
            <ModalHeader close={closeButton}>
                {title}
            </ModalHeader>
            <ModalBody>
                <IsaacContent doc={body} />
            </ModalBody>
        </Modal>
    </div>
};
