import React, { createContext, ReactNode, useContext } from "react";
import { useGetSegueEnvironmentQuery } from "../state";

export enum FeatureFlag {
    TEST_FEATURE = "TEST_FEATURE",
}

const useFlags = () : Record<FeatureFlag, boolean> => {
    const { data: env } = useGetSegueEnvironmentQuery();
    const isNonProd = env === "DEV";

    return {
        [FeatureFlag.TEST_FEATURE]: isNonProd,
    };
};

const FeatureFlagContext = createContext<Record<FeatureFlag, boolean> | undefined>(undefined);

export const FeatureFlagProvider = ({ children }: { children: React.ReactNode }) => {
    const flags = useFlags();
    return <FeatureFlagContext.Provider value={flags}>
        {children}
    </FeatureFlagContext.Provider>;
};

/**
 * A hook to obtain the enabled status of a feature flag or array of feature flags.
 * @see FeatureFlagWrapper for a simple component wrapper using this hook.
 * 
 * @param flag The flag(s) to obtain the status of.
 * @returns The enabled status of the flag(s). If an array is provided, returns true if any of the flags are enabled.
 */
export const useFeatureFlag = (flag: FeatureFlag | FeatureFlag[]): boolean => {
    const allFlags = useContext(FeatureFlagContext);
    if (!allFlags || flag === undefined) return false;
    if (Array.isArray(flag)) {
        return flag.some(f => allFlags[f]);
    } else {
        return allFlags[flag] || false;
    }
};

interface FeatureFlagComponentProps {
    flag: FeatureFlag | FeatureFlag[];
    children?: React.ReactElement;
    onSet?: ReactNode;
    onUnset?: ReactNode;
};

/**
 * A component to conditionally render content based on the status of a feature flag or array of feature flags.
 * @see useFeatureFlag for more complex logic.
 */
export const FeatureFlagWrapper = ({ flag, children, onSet, onUnset }: FeatureFlagComponentProps) => {
    const enabled = useFeatureFlag(flag);
    return <>{enabled ? children ?? onSet : onUnset}</>;
};
