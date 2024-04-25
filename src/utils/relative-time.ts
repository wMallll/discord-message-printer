interface RelativeTimeData {
    value: number,
    unit: Intl.RelativeTimeFormatUnit
}

const second = 1000;
const minute = second * 60; 
const hour = minute * 60;
const day = hour * 24;
const month = day * 31;
const year = month * 12;

export function relativeTime(date: Date, locales?: string | string[]) {
    
    const difference = Date.now() - date.getTime();
    const absoluteDifference = Math.abs(difference);
    
    const data: RelativeTimeData = { value: 1, unit: "second" };
    let calculated = 1;

    if (absoluteDifference < minute && absoluteDifference > second) {
        calculated = Math.round(difference / second);
        data.unit = calculated === 1 ? "second" : "seconds";
    } else if (absoluteDifference < hour && absoluteDifference > second) {
        calculated = Math.round(difference / minute);
        data.unit = calculated === 1 ? "minute" : "minutes";
    } else if (absoluteDifference < day && absoluteDifference > second) {
        calculated = Math.round(difference / hour);
        data.unit = calculated === 1 ? "hour" : "hours";
    } else if (absoluteDifference < month && absoluteDifference > second) {
        calculated = Math.round(difference / day);
        data.unit = calculated === 1 ? "day" : "days"
    } else if (absoluteDifference < year && absoluteDifference > second) {
        calculated = Math.round(difference / month);
        data.unit = calculated === 1 ? "month" : "months";
    } else if (absoluteDifference > year && absoluteDifference > second) {
        calculated = Math.round(difference / year);
        data.unit = calculated === 1 ? "year" : "years";
    }

    data.value = calculated * -1;
    
    return new Intl.RelativeTimeFormat(locales).format(data.value, data.unit);

}