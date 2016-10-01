import getSubstringIndex from './substring-nth';

export function metaDescription(meta) {
    return meta.substring(getSubstringIndex(meta, '</h2>', 1) + 5, getSubstringIndex(meta, '<h3', 1));
}

export function metaImportant(meta) {
    return meta.substring(getSubstringIndex(meta, '</h3>', 1) + 5, getSubstringIndex(meta, '<h3', 2));
}

export function metaAbout(meta) {
    return meta.substring(getSubstringIndex(meta, '</h3>', 2) + 5, getSubstringIndex(meta, '<h3', 3));
}

export function metaResources(meta) {
    let resources = meta.substring(getSubstringIndex(meta, '</h3>', 3) + 5, meta.length);
    resources = resources.replace(/\<table/g, '<table class="mdl-data-table mdl-js-data-table meta-table"');
    return resources;
}
