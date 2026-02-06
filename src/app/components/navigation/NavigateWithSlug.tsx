
import React from "react";
import { Navigate, NavigateProps, useParams } from "react-router";

/**
 * RR7 `<Redirect />` components do not support maintaining the slug, e.g. you cannot easily redirect from `/foo/:id` to `/bar/:id`
 * without making a custom component to extract the id and then redirect.
 * 
 * This component is a wrapper around `<Navigate />` that extracts any slugs from the current URL and applies them to the target URL,
 * allowing you to redirect while maintaining all slugs.
 * 
 *  This will only work for from / to paths that:
 *  - have the same slugs (e.g. `/foo/:id/:otherId` to `/bar/:id/baz/:otherId`)
 *  - maintain the same url structure (will not support `/foo/:id` to `/bar#:id`; use a custom redirect for this)
 */ 
export const NavigateWithSlug = (props: NavigateProps) => {
    const { to, ...rest } = props;
    const path = typeof to === "string" ? to : to.pathname || "";
    const params = useParams();
    const slugs = Object.entries(params).filter(([_, value]) => typeof value === "string") as [string, string][];
    const targetPath = slugs.length ? slugs.reduce((acc, [key, slug]) => acc.replace(`:${key}`, slug), path) : path;
    const target = typeof to === "string" ? targetPath : { ...to, pathname: targetPath };
    return <Navigate to={target} {...rest} />;
};
