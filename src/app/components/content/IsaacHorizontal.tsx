import React from "react";
import * as RS from "reactstrap";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";

interface IsaacHorizontalProps {
    doc: {
        children: {
            id?: string;
            title?: string;
            children?: ContentDTO[];
        }[];
    };
}

export const IsaacHorizontal = (props: any) => {
    const {doc: {children}} = props as IsaacHorizontalProps;
    const numberOfColumns = children.length;

    return <RS.Container>
        <RS.Row>
            {children.map((child, index) => (
                <RS.Col key={index} lg={Math.floor(12/numberOfColumns)}>
                    <IsaacContent key={index} doc={child} />
                </RS.Col>
            ))}
        </RS.Row>
    </RS.Container>;
};
