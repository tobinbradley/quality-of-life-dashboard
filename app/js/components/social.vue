<template lang="html">
    <p class="text-muted">
        <a href="javascript:void(0)" aria-label="Share on Twitter" v-on:click="social('twitter')"><svg class="icon icon-twitter-with-circle"><use xlink:href="#icon-twitter-with-circle"></use></svg></a>
        <a href="javascript:void(0)" aria-label="Share on Facebook" v-on:click="social('facebook')"><svg class="icon icon-facebook-with-circle"><use xlink:href="#icon-facebook-with-circle"></use></svg></a>
        <a href="javascript:void(0)" aria-label="Share on LinkedIn" v-on:click="social('linkedin')"><svg class="icon icon-linkedin-with-circle"><use xlink:href="#icon-linkedin-with-circle"></use></svg></a>
        <a href="https://github.com/DataWorks-NC/quality-of-life-dashboard" aria-label="View project on Github"><svg class="icon icon-brand-github"><use xlink:href="#icon-brand-github"></use></svg></a>
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

<style lang="css" scoped>
    .icon {
        width: 24px;
        height: 24px;
    }
    .icon-twitter-with-circle {
        fill: #1DA1F2;
    }
    .icon-facebook-with-circle {
        fill: #4E71A8;
    }
    .icon-linkedin-with-circle {
        fill: #1686B0;
    }
    .icon-brand-github {
        fill: #0F0F0F;
    }
</style>
