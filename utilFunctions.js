const extractPhNum = (str) => {
    // extract all numbers from string
    return str.match(/\d+/g).join('');
}

const extractSlotInfo = (str) => {
    const timeSlots = [
        { start: 9, end: 12, label: 1 },
        { start: 12, end: 15, label: 2 },
        { start: 15, end: 18, label: 3 },
        { start: 18, end: 21, label: 4 },
        { start: 21, end: 24, label: 5 },
    ];

    const timeRegex = /(\d{1,2})([-/:])?(\d{2})?\s*(AM|PM)?/i; // Case-insensitive
    const match = str.match(timeRegex);

    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = match[3] ? parseInt(match[3], 10) : 0;
        const ampm = (match[4] || '').toUpperCase();
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            if (ampm === 'PM' && hour < 12) {
                hour += 12;
            } else if (ampm === 'AM' && hour === 12) {
                hour = 0;
            }

            for (const slot of timeSlots) {
                if (hour >= slot.start && hour < slot.end) {
                    return slot.label;
                }
            }
        }
    }
    return null;
};

const extractPeopleRange = (str) => {
    // Regular expression to match "a-b" or "a" pattern
    const pattern = /^(\d+)(?:-(\d+))?$/;

    const numericStr = str.replace(/\D/g, '');
    const match = numericStr.match(pattern);

    if (match) {
        const a = parseInt(match[1], 10);
        let b = a;

        if (match[2]) {
            b = parseInt(match[2], 10);
        }   

        const slotBoundaries = [0, 2, 4, 6];
        const highestNumber = Math.max(a, b);
        const slot = slotBoundaries.findIndex((boundary) => highestNumber <= boundary);

        return slot !== -1 ? slot : slotBoundaries.length;
    }
    return null;
};

const extractDiscountPercentage = (str) => {
    // regular expression to match number and % symbol. % sign maynot be present. Any thing else apart from first found number shall be ignored
    // not for decimals as of now
    const pattern = /(\d+(?:\.\d+)?)(?:%|\b)/;
    const match = str.match(pattern);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}

const generateSummary = (phNum, slotNumber, peopleRange, discountPer) => {
    // generate a summary message saying phnum asking for slotNumber for peopleRange with discountPer
    // return summary;
    return `Summary: ${phNum} asking for ${slotNumber} slot, for ${peopleRange} peoples, with discount ${discountPer}`;
}

// Example usage:
// const slotNumber1 = extractPeopleRange("7-8");
// const slotNumber2 = extractPeopleRange("9");
// console.log("Slot Number 1:", slotNumber1); // Should return 2 (highest number is 6)
// console.log("Slot Number 2:", slotNumber2); // Should return 2 (number is 7)

// const discountPer = extractDiscountPercentage("10%");
// console.log("Discount Percentage:", discountPer);
// const discountPer2 = extractDiscountPercentage("val17.132");
// console.log("Discount Percentage:", discountPer2);
// const slotNumber = extractSlotInfo("1pm");
// console.log("Slot Number:", slotNumber);
export default { extractPhNum, extractSlotInfo, extractPeopleRange, extractDiscountPercentage, generateSummary};