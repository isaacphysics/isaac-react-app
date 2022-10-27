import {useLocation} from "react-router-dom";
import * as queryString from "querystring";
import {isDefined} from "./";

function firstIfList(value: string | string[]): string {
    if (typeof value !== "string") {
        return value[0];
    } else {
        return value;
    }
}

function removeQuestionMark(str: string) {
    if (str.startsWith("?")) {
        return str.slice(1);
    } else {
        return str;
    }
}

export function useQueryParams<B extends boolean>(takeFirstValue?: B):
    B extends true ? {[key: string]: string | undefined} : {[key: string]: string | string[] | undefined}
{
    const query = queryString.parse(useLocation().search);
    if (takeFirstValue && isDefined(query)) {
        return Object.assign({}, ...Object.keys(query).map(key => ({[removeQuestionMark(key)]: firstIfList(query[key] as (string|string[]))})));
    } else {
        return Object.assign({}, ...Object.keys(query).map(key => ({[removeQuestionMark(key)]: query[key]})));
    }
}

export function useUrlHashValue() {
    const hash = useLocation().hash;
    if (hash.includes("#")) {
        return hash.slice(1);
    }
    return null;
}

export function usePathname() {
    return useLocation().pathname;
}

// export function useRouteState<T>() {
//     return useLocation<T>().state;
// }

