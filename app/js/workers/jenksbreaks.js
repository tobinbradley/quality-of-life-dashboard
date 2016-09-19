import isNumeric from '../modules/isnumeric';
import jenks from '../modules/jenks';


self.addEventListener('message', function(e) {
    let data = e.data;
    self.postMessage(mapBreaks(data[0], data[1], data[2]));
    self.close();
}, false);


function mapBreaks(data, years, breaks = 5) {
    let jenksArray = [];
    for (let i in data) {
        for (let y = 0; y < years.length; y++) {
            if (isNumeric(data[i][`y_${years[y]}`])) {
                jenksArray.push(data[i][`y_${years[y]}`]);
            }
        }
    }
    return jenks(jenksArray, breaks);
}
