import jenks from './jenks';
import {valsToArray} from './metric_calculations';


// With more than a few years worth of data, jenks calculations can take a long time.
// So I'm cheating here a bit. I do a jenks calculation with just the last two years if
// more than 1 year is available. Then I replace the min and max values from the
// full set so nothing falls between the cracks.

export default function jenksBreaks(data, years, keys, breaks = 5) {
    let jenksYears = [years[years.length - 1]];
    if (years.length > 1) {
        jenksYears.push(years[years.length - 2]);
    }

    let allVals = valsToArray(data, years, keys);
    let jenksVals = valsToArray(data, [years[years.length - 1]], keys);

    let jenksArray = jenks(jenksVals, breaks);

    jenksArray[0] = Math.min.apply(Math, allVals);
    jenksArray[jenksArray.length - 1] = Math.max.apply(Math, allVals);

    return jenksArray;
}
