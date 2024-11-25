import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface TdLinkProps extends React.HTMLAttributes<HTMLTableCellElement> {
    to: string | undefined;
}

interface TrLinkProps extends React.HTMLAttributes<HTMLTableRowElement> {
    to: string | undefined;
}

// an <a/> anywhere between a <table/> and a <td/> is illegal, so a row can't be wrapped in a <Link/>. instead, each <td/> contains a link.
export const TdLink = ({to, children, ...rest}: TdLinkProps) => {
    return <td {...rest} className={classNames(rest.className, "td-link")}>{to ? <Link to={to}>{children}</Link> : <>{children}</>}</td>;
};

// this wrapper exists such that you only need specify the link prop once per row.
// just drop <TrLink to={...}> in place of a <tr/>.
export const TrLink = ({to, children, ...rest}: TrLinkProps) => {
    return <tr {...rest}>
        {React.Children.map(children, child => React.isValidElement(child) && child.type === "td" ? <TdLink to={to} {...child.props}/> : child)}
    </tr>;
};
