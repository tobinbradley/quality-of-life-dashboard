<template lang="html">
    <footer class="mdl-grid">
        <div class="mdl-typography--text-center mdl-cell mdl-cell--12-col mdl-cell--12-col-tablet">
            <p>
                <img src="img/seals.png" width="177" height="36" alt="City and County Seals">
            </p>
            <p class="site-links" v-if="privateState.links" >
                <a v-for="link in privateState.links" v-bind:href="link.href" target="_blank">{{link.text}}</a>
            </p>
            
            <p class="text-muted">
                Created by <a href="http://charmeck.org/mecklenburg/county/Pages/Default.aspx">Mecklenburg County</a>, the <a href="http://charmeck.org/city/charlotte/Pages/default.aspx">City of Charlotte</a>, and <a href="http://www.uncc.edu/">UNC Charlotte</a>
                with much &#9829; for the projects that make this site possible:
                <br>
                <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>,
                <a href="http://osm2vectortiles.org/" target="_blank">OSM2VectorTiles</a>,
                <a href="https://www.mapbox.com/mapbox-gl-js/api/" target="_blank">Mapbox GL JS</a>,
                <a href="http://vuejs.org/" target="_blank">Vue.js</a>, and
                <a href="http://getmdl.io/" target="_blank">Material Design Lite</a>.
            </p>
            <p class="text-muted">
                Share on 
                <a href="javascript:void(0)" v-on:click="social('twitter')"><img src="img/icon_twitter.svg" alt="share on twitter" style="height: 22px;"></a>
                <a href="javascript:void(0)" v-on:click="social('facebook')"><img src="img/icon_facebook.svg" alt="share on facebook" style="height: 22px;"></a>
                <a href="javascript:void(0)" v-on:click="social('linkedin')"><img src="img/icon_linkedin.svg" alt="share on linkedin" style="height: 22px;"></a>
                &bull;
                Source code on <a href="https://github.com/tobinbradley/quality-of-life-dashboard"><img src="img/icon_github.svg" alt="source code on github" style="height: 22px;"></a>
            </p>
        </div>
    </footer>
</template>

<script>
import {metaDescription} from '../modules/meta';

export default {
    name: 'sc-footer',
    watch: {

    },
    methods: {
        social: function (socialType) {
            let _this = this;
            let pageUrl = encodeURIComponent(document.URL);
            if (socialType === 'twitter') {
                let socialUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodeURIComponent(_this.sharedState.metric.config.title)}`;
                window.open(socialUrl, "Share");
            }
            if (socialType === 'facebook') {
                let socialUrl = `https://www.facebook.com/sharer.php?u=${pageUrl}`;
                window.open(socialUrl, "Share");
            }
            if (socialType === 'linkedin') {
                let socialUrl = `https://www.linkedin.com/shareArticle?url=${pageUrl}`;
                window.open(socialUrl, "Share");
            }
        }
    }
}
</script>

<style lang="css" scoped>

</style>
