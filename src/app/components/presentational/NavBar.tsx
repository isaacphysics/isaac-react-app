import {Link} from "react-router-dom";
import React from "react";

const NavBar = () =>
    <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/question/fci_quiz1_1">Question</Link></li>
    </ul>;

export default NavBar;
