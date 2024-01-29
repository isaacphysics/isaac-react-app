import {Alert} from "reactstrap";
import React, {ReactNode, useEffect} from "react";

type FocusedAlertProps = {
    color: 'warning'
    children: ReactNode
}

export const FocusedAlert = (props: FocusedAlertProps) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    return <Alert color={props.color}>
        {props.children}
    </Alert>
}