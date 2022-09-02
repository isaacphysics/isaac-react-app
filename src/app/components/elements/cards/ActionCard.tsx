import React from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {Badge} from "reactstrap";

interface ActionCardProps {
    title: string;
    amountText: React.ReactElement;
    linkDestination: string;
    linkText: string;
    comingSoon?: boolean;
    children?: React.ReactChildren | string;
}

export const ActionCard = ({title, amountText, linkDestination, linkText, comingSoon=false, children}: ActionCardProps) => {
    const comingSoonMessage = <React.Fragment>
        This functionality is {" "}
        <Badge color="light" className="border-secondary border bg-white ml-auto mr-1">
            Coming soon
        </Badge>.
    </React.Fragment>;

    return (
        <div className="action-card my-0">
            <h2 className="py-3">
                {title}
            </h2>
            <p>
                {comingSoon ? comingSoonMessage : amountText}
            </p>
            <p>
                <>{children}</>
            </p>
            <RS.Button tag={Link} to={linkDestination} color="secondary" block disabled={comingSoon}>
                {linkText}
            </RS.Button>
        </div>

    );
};
