import getURLParameter from './geturlparams.js';

function replaceState(metric, selected) {
  location.hash = `${metric}/${selected.join(',')}`;
}

function gaEvent(type, title, category) {
  if (window.ga) {
    ga('send', 'event', type, title, category);
  }
}

function urlArgsToHash() {
  let m = '';
  let s = '';
  if (getURLParameter('m')) {
    m = getURLParameter('m');
  }
  if (getURLParameter('s')) {
    s = getURLParameter('s');
  }
  if (m.length > 0 || s.length > 0) {
    history.replaceState(null, null, '.');
    replaceState(m, s.split(','));
  }
}

function getHash(pos = 0) {
  let hash = location.hash.split('/');
  if (hash[pos] && hash[pos].length > 0) {
    hash[pos] = hash[pos].toString().replace('#', '');
    if (pos === 1) {
      return hash[pos].split(',');
    } else {
      return hash[pos];
    }
  } else {
    return false;
  }
}

export {replaceState, gaEvent, urlArgsToHash, getHash};
