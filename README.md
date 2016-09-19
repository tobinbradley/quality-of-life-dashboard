# Quality of Life Embed/Print

An independent project related to the [Quality of Life Dashboard](https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard).

[DEMO](http://mcmap.org/qol-embed/)

## Setup

``` bash
git clone https://github.com/tobinbradley/quality-of-life-embed.git
cd quality-of-life-embed
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data data
npm run datagen
npm run build
```

## Start the project

``` bash
npm run start
```

## URL Arguments

*   *m*: metric id (integer)
*   *t*: title
*   *b*: map bounds (sw.lng, sw.lat, ne.lng, ne.lat)
*   *s*: selected geography (id1, id2, ...)
*   *y*: metric year (integer)
