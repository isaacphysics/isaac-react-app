export const DateString = ({children, defaultValue}: {children: any; defaultValue?: any}) => {
    const fallback = defaultValue || "NOT A VALID DATE";
    try {
        return (children && new Date(children).toUTCString()) || fallback;
    } catch (e) {
        return fallback;
    }
};
