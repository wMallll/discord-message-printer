// thanks to: https://gist.github.com/LeviSnoot/d9147767abeef2f770e9ddcd91eb85aa

import { relativeTime } from "./relative-time";

export default function discordDateFormat(date: Date, format: string) {
    switch (format) {
        case "t":
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

        case "T":
            return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        case "d":
            return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" });
        
        case "D":
            return date.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });

        case "D":
            return date.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
    
        case "F":
            return date.toLocaleString(undefined, { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

        case "R":
            return relativeTime(date);

        // f
        default:
            return date.toLocaleString(undefined, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    
    }
}