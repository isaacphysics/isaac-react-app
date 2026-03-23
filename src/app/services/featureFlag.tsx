import React, { createContext, ReactNode, useContext, useState } from "react";
import { closeActiveModal, store, useGetSegueEnvironmentQuery } from "../state";
import { ActiveModalProps } from "../../IsaacAppTypes";
import { Button, Col } from "reactstrap";
import { KEY, persistence } from "./localStorage";
import { Spacer } from "../components/elements/Spacer";
import { StyledTripleToggle } from "../components/elements/inputs/StyledMultiToggle";

export enum FeatureFlag {
    _TEST_FEATURE = "_TEST_FEATURE", // used for testing; do not remove
    ENABLE_ADA_SIDEBARS = "ENABLE_ADA_SIDEBARS",
}

const loadOverridesFromStorage = (): Partial<Record<FeatureFlag, boolean>> => {
    const overridesString = persistence.load(KEY.FEATURE_FLAG_OVERRIDES);
    if (overridesString) {
        try {
            return JSON.parse(overridesString) as Partial<Record<FeatureFlag, boolean>>;
        } catch (e) {
            console.error("Failed to parse feature flag overrides from local storage. Ignoring overrides.", e);
        }
    }
    return {};
};

const saveOverridesToStorage = (overrides: Partial<Record<FeatureFlag, boolean>>) => {
    persistence.save(KEY.FEATURE_FLAG_OVERRIDES, JSON.stringify(overrides));
};

const useFlags = () : Record<FeatureFlag, boolean> => {
    const { data: env } = useGetSegueEnvironmentQuery();
    const isNonProd = env === "DEV";
    
    const overrides = isNonProd ? loadOverridesFromStorage() : {};

    return {
        // default values
        [FeatureFlag._TEST_FEATURE]: isNonProd,
        [FeatureFlag.ENABLE_ADA_SIDEBARS]: false,

        // overrides
        ...overrides
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
    return enabled ? children ?? onSet : onUnset;
};


const FeatureFlagModalBody = () => {
    const [overrides, setOverrides] = useState(loadOverridesFromStorage());
    const allFlags = Object.values(FeatureFlag).filter(f => f !== FeatureFlag._TEST_FEATURE);

    return <Col>
        <p>Feature flags are staff-only runtime switches that enable or disable features that are under development. They will only appear on staging and dev (not test).</p>
        <p>Relevant flags will typically be enabled by default on a given branch. However, if you wish to see how multiple settings interact, you can override which flags are enabled below.</p>
        <p>Note that overrides will be maintained between site visits and should probably be left as automatic when not in use.</p>

        <p className="mt-5">Manual overrides:</p>
        {allFlags.length
            ? <ul className="list-unstyled ps-3">
                {allFlags.map(flag => 
                    <div className="w-100 d-flex align-items-center my-1" key={flag}>
                        <span>{flag.toString()}</span>
                        <Spacer />
                        <StyledTripleToggle initialValue={overrides[flag]} onChange={(value) => setOverrides(prev => ({ ...prev, [flag]: value }))} />
                    </div>
                )}
            </ul>
            : <p><em>No feature flags found.</em></p>
        }

        <div className="d-flex w-100 justify-content-around mt-5">
            <div className="d-flex gap-2 align-items-center">
                <i className="icon icon-cross" />
                Off
            </div>
            <div className="d-flex gap-2 align-items-center">
                <i className="icon icon-dash" />
                Automatic
            </div>
            <div className="d-flex gap-2 align-items-center">
                <i className="icon icon-tick" />
                On
            </div>
        </div>

        <Button color="primary" className="w-100 mt-5" onClick={() => {
            saveOverridesToStorage(overrides);
            window.location.reload();
        }}>
            Apply and reload
        </Button>
    </Col>;
};

export const FeatureFlagModal : ActiveModalProps = ({
    closeAction: () => store.dispatch(closeActiveModal()),
    size: "md",
    title: "Feature Flags",
    body: <FeatureFlagModalBody />
});

export const hasActiveFeatureFlagOverrides = (): boolean => {
    const overrides = loadOverridesFromStorage();
    return Object.keys(overrides).length > 0;
};
