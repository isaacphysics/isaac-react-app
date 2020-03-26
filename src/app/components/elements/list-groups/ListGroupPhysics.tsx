import React from "react";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";

export const ListGroupPhysics = () => (
    <ListGroup className="w-50 mb-3 link-list">
        <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
            <Link className="footerLink py-2" to="/why_physics">Why Physics?</Link>
        </ListGroupItem>
        <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
            <Link className="footerLink py-2" to="/bios">Biographies</Link>
        </ListGroupItem>
        <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
            <Link className="footerLink py-2" to="/publications">Publications</Link>
        </ListGroupItem>
        <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
            <Link className="footerLink py-2" to="/extraordinary_problems">Extraordinary Problems</Link>
        </ListGroupItem>
        <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
            <Link className="footerLink py-2" to="/challenge_problems">Challenge of the Month</Link>
        </ListGroupItem>
    </ListGroup>
);
