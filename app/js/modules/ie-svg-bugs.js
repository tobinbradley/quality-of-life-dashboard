// fix svg problems in IE 11

export default function ieSVGFixes() {
  if (navigator.userAgent.indexOf('Trident') > 0) {
    setTimeout(function() {
      // fix disappearing icons
      let elems = document.querySelectorAll('svg.icon use');
      for (let i = 0; i < elems.length; i++) {
        let link = elems[i].getAttributeNS(
          'http://www.w3.org/1999/xlink',
          'href',
        );
        elems[i].setAttributeNS('http://www.w3.org/1999/xlink', 'href', link);
      }

      // fix toc legend click makes it disappear
      document.querySelector('#maplegend').style.pointerEvents = 'none';
    }, 5000);
  }
}
