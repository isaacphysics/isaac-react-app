import { PATH_NAMES, PATHS } from "./constants";

interface DynamicValues {
    PATH_NAMES: { [k in keyof typeof PATHS]: string };
    CRUMBS: { [k in keyof typeof PATHS]: {title: string, to: string}[] };
}

export const useDynamicValues = (): DynamicValues => {
    // TODO: actually use hooks (e.g. feature flags, internationalisation, etc).
    const DYNAMIC_PATH_NAMES = {
        ...PATH_NAMES,
    };

    const CRUMBS = Object.keys(PATHS).reduce((crumbs, path) => {
        const typedPath = path as keyof typeof PATHS;
        return {
            ...crumbs,
            [path]: [{title: DYNAMIC_PATH_NAMES[typedPath], to: PATHS[typedPath]}]
        };
    }, {} as { [k in keyof typeof PATHS]: {title: string, to: string}[] });

    return {
        PATH_NAMES: DYNAMIC_PATH_NAMES,
        CRUMBS,
    };
};
