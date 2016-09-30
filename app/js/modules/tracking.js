function replaceState(metric, selected) {
    window.history.replaceState(null, null, `./?m=${metric}&s=${selected.join(',')}`);
}

function gaEvent(type, title, category) {
    if (window.ga) {
        ga('send', 'event', type, title, category);
    }
}


export {replaceState, gaEvent};
