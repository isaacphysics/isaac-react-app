import React, {CSSProperties, useEffect, useState} from 'react';
import Select, {
    GroupProps,
    OptionProps,
    components as SelectComponents,
    StylesConfig
} from 'react-select';
import moment, {Moment} from "moment";
import * as chrono from "chrono-node";
import {GroupBase} from "react-select/dist/declarations/src/types";
import {StateManagerProps} from "react-select/dist/declarations/src/useStateManager";
import {isDefined} from "../../../services";

/**
 * Adapted from a recipe in the react-select docs
 * https://github.com/JedWatson/react-select/blob/master/docs/examples/Experimental.tsx
 */

export interface DateOption {
    date: Moment;
    value: Date;
    label: string;
    display?: string;
}

export const createOptionForDate = (d: Moment | Date) => {
    const date = moment.isMoment(d) ? d : moment(d);
    return {
        date,
        value: date.toDate(),
        label: date.calendar(null, {
            sameDay: '[Today] (Do MMM YYYY)',
            nextDay: '[Tomorrow] (Do MMM YYYY)',
            nextWeek: '[Next] dddd (Do MMM YYYY)',
            lastDay: '[Yesterday] (Do MMM YYYY)',
            lastWeek: '[Last] dddd (Do MMM YYYY)',
            sameElse: 'Do MMMM YYYY',
        }),
    };
};

interface CalendarGroup {
    label: string;
    options: readonly DateOption[];
}

const createCalendarOptions: (date: Date) => CalendarGroup = (date = new Date()) => {
    const daysInMonth = Array.apply(null, Array(moment(date).daysInMonth())).map(
        (x, i) => {
            const d = moment(date).date(i + 1);
            return { ...createOptionForDate(d), display: 'calendar' };
        }
    );
    return {
        label: moment(date).format('MMMM YYYY'),
        options: daysInMonth
    };
};

const todayOnwardsOptions: (date?: Date, hideCalendar?: boolean) => (DateOption | CalendarGroup)[] = (date = new Date(), hideCalendar?: boolean) =>
    ([
        'today',
        'tomorrow',
        'next week'
    ].map((i) => createOptionForDate(chrono.en.GB.parseDate(i, date) ?? chrono.parseDate(i, date))) as (DateOption | CalendarGroup)[])
        .concat((hideCalendar ? [] : [createCalendarOptions(date)]) as any);

const suggestions = [
    'sunday',
    'saturday',
    'friday',
    'thursday',
    'wednesday',
    'tuesday',
    'monday',
    'december',
    'november',
    'october',
    'september',
    'august',
    'july',
    'june',
    'may',
    'april',
    'march',
    'february',
    'january',
    'yesterday',
    'tomorrow',
    'today',
].reduce<{ [key: string]: string }>((acc, str) => {
    for (let i = 1; i < str.length; i++) {
        acc[str.slice(0, i)] = str;
    }
    return acc;
}, {});

const suggest = (str: string) =>
    str.split(/\b/)
        .map((i) => suggestions[i] || i)
        .join('');

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const daysHeaderStyles = {
    marginTop: '5px',
    paddingTop: '5px',
    paddingLeft: '2%',
    borderTop: '1px solid #eee',
};
const daysHeaderItemStyles = {
    color: '#999',
    cursor: 'default',
    fontSize: '75%',
    fontWeight: 500,
    display: 'inline-block',
    width: '12%',
    margin: '0 1%',
    textAlign: 'center',
};
const daysContainerStyles = {
    paddingTop: '5px',
    paddingLeft: '2%',
};

const Group = (props: GroupProps<DateOption, false>) => {
    const {
        Heading,
        getStyles,
        children,
        label,
        headingProps,
        cx,
        theme,
        selectProps,
    } = props;
    return <div aria-label={label as string} style={getStyles('group', props) as CSSProperties}>
        <Heading
            selectProps={selectProps}
            theme={theme}
            getStyles={getStyles}
            cx={cx}
            {...headingProps}
        >
            {label}
        </Heading>
        <div style={daysHeaderStyles}>
            {days.map((day, i) =>
                <span key={`${i}-${day}`} style={daysHeaderItemStyles as CSSProperties}>
                    {day}
                </span>)}
        </div>
        <div style={daysContainerStyles}>
            {children}
        </div>
    </div>;
};

const getOptionStyles = (defaultStyles: CSSProperties): CSSProperties => ({
    ...defaultStyles,
    display: 'inline-block',
    width: '12%',
    margin: '0 1%',
    textAlign: 'center',
    borderRadius: '4px',
});

const Option = (props: OptionProps<DateOption, false>) => {
    const { data, getStyles, innerRef, innerProps } = props;
    if (data.display === 'calendar') {
        const defaultStyles = getStyles('option', props) as CSSProperties;
        const styles = getOptionStyles(defaultStyles);
        if (data.date.date() === 1) {
            const indentBy = data.date.day();
            if (indentBy) {
                styles.marginLeft = `${indentBy * 14 + 1}%`;
            }
        }
        return <span {...innerProps} style={styles} ref={innerRef}>
            {data.date.format('D')}
        </span>;
    }
    return <SelectComponents.Option {...props} />;
};

export const customStyles: StylesConfig<DateOption, false, GroupBase<DateOption>> = {
    control: (base, state) => {
        // @ts-ignore
        if (state.selectProps.isInvalid) { // "state.selectProps" references the component props
            return {
                ...base,
                border: "solid 1px #dc3545",
                "&:hover": {
                    border: "solid 1px #dc3545"
                },
            };
        }
        return base;
    },
    dropdownIndicator: (base, state) => {
        // @ts-ignore
        if (state.selectProps.isInvalid) { // "state.selectProps" references the component props
            return {
                ...base,
                fill: "#dc3545",
                color: "#dc3545",
            };
        }
        return base;
    },
    indicatorSeparator: (base, state) => {
        // @ts-ignore
        if (state.selectProps.isInvalid) { // "state.selectProps" references the component props
            return {
                ...base,
                backgroundColor: "rgba(220,53,69,0.25)",
            };
        }
        return base;
    },
    menu: (base) => ({...base, zIndex: 5}),
};

type DatePickerProps = {
    value: DateOption | null;
    onChange: (value: DateOption | null) => void;
    referenceDate?: Date;
    isInvalid?: boolean;
    hideCalendar?: boolean;
} & StateManagerProps<DateOption, false, GroupBase<DateOption>>;
export const DatePicker = (props: DatePickerProps) => {
    const {value, referenceDate, hideCalendar} = props;
    const [options, setOptions] = useState<(DateOption | CalendarGroup)[]>(todayOnwardsOptions(referenceDate, hideCalendar));

    const handleInputChange = (value: string) => {
        if (!value) {
            setOptions(todayOnwardsOptions(referenceDate, hideCalendar));
            return;
        }
        const suggestion = suggest(value.toLowerCase())
        const date = chrono.en.GB.parseDate(suggestion, referenceDate);
        if (date) {
            setOptions([createOptionForDate(date)].concat((hideCalendar ? [] : [createCalendarOptions(date)]) as any));
        } else {
            setOptions([]);
        }
    };

    useEffect(() => {
        setOptions(todayOnwardsOptions(referenceDate, hideCalendar));
    }, [referenceDate]);

    return <Select
        {...props}
        components={{ Group, Option }}
        filterOption={null}
        isMulti={false}
        isOptionSelected={(o, v) => v.some((i) => i.date.isSame(o.date, 'day'))}
        maxMenuHeight={380}
        onInputChange={handleInputChange}
        options={options}
        value={value}
        placeholder={props.placeholder ?? "Start typing... (e.g. Next Wednesday)"}
        styles={customStyles}
    />
};