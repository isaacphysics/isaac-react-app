import {Alert} from "reactstrap";
import React, {ReactNode, useEffect} from "react";

type ExigentAlertProps = {
    color: 'warning'
    children: ReactNode
}

export const ExigentAlert = (props: ExigentAlertProps) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    return <Alert color={props.color}>
        {props.children}
    </Alert>
}