<template lang="html">
    <p class="text-muted">
        <a href="javascript:void(0)" v-on:click="social('twitter')"><img src="img/icon_twitter.svg" alt="share on twitter" style="height: 22px;"></a>
        <a href="javascript:void(0)" v-on:click="social('facebook')"><img src="img/icon_facebook.svg" alt="share on facebook" style="height: 22px;"></a>
        <a href="javascript:void(0)" v-on:click="social('linkedin')"><img src="img/icon_linkedin.svg" alt="share on linkedin" style="height: 22px;"></a>
        <a href="https://github.com/tobinbradley/quality-of-life-dashboard"><img src="img/icon_github.svg" alt="source code on github" style="height: 22px;"></a>
    </p>    
</template>

<script>
export default {
    name: 'sc-social',    
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
