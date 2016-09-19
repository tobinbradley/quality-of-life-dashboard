import isNumeric from './isnumeric';

function sum(arr) {
    let sum = arr.reduce(function(sum, x) {
        return sum + x;
    }, 0);
    if (arr.length === 0) { sum = '--'; }
    return sum;
}

function mean(arr) {
    return sum(arr) / arr.length;
}

function weighted(arr, weight) {
    let sumR = sum(arr);
    let sumW = sum(weight);
    return sumR / sumW;
}

function valsToArray(data, years, keys) {
    let arr = [];
    for (let y = 0; y < years.length; y++) {
        for (var i = 0; i < keys.length; i++) {
            if (isNumeric(data[keys[i]][`y_${years[y]}`])) {
                arr.push(data[keys[i]][`y_${years[y]}`]);
            }
        }
    }
    return arr;
}

function wValsToArray(data, weight, years, keys) {
    let arr = [];
    for (let y = 0; y < years.length; y++) {
        for (var i = 0; i < keys.length; i++) {
            if (isNumeric(data[keys[i]][`y_${years[y]}`]) && isNumeric(weight[keys[i]][`y_${years[y]}`])) {
                arr.push(data[keys[i]][`y_${years[y]}`] * weight[keys[i]][`y_${years[y]}`]);
            }
        }
    }
    return arr;
}

function calcValue(data, calcType = sum, year, keys) {
    if (calcType === 'sum') {
        let dataArray = valsToArray(data.map, [year], keys);
        return sum(dataArray);
    }
    if (calcType === 'mean') {
        let dataArray = valsToArray(data.map, [year], keys);
        return mean(dataArray);
    }
    if (calcType === 'weighted') {
        let dataArray = wValsToArray(data.map, data.w, [year], keys);
        let wArray = valsToArray(data.w, [year], keys);
        return weighted(dataArray, wArray);
    }
    return false;
}


export {sum, mean, weighted, valsToArray, wValsToArray, calcValue};
