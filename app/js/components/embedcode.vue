<template lang="html">
    <div v-show="privateState.qolembedURL" class="mdl-typography--text-center mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet flexcontainer">
        <div v-if="sharedState.metric.config" class="embedcode">
            <h3>Embed This Map</h3>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused" id="embed-title">
                <input class="mdl-textfield__input" type="text" id="embedTitle" v-bind:value="sharedState.metric.config.title" v-model="privateState.title" autocomplete="off">
                <label class="mdl-textfield__label" for="embedTitle">Map Title</label>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused" id="embed-textarea">
                <textarea class="mdl-textfield__input" type="text" rows= "5" id="embedIframeCode" onclick="this.select()" v-on:keypress.stop.prevent autocomplete="off">{{createIframe(privateState.title)}}</textarea>
                <label class="mdl-textfield__label" for="embedIframeCode">Drop this in your web page</label>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'sc-embedcode',
    watch: {
        'sharedState.metric.config': 'updateTitle'
    },
    methods: {
        updateTitle: function() {
            this.privateState.title = this.sharedState.metric.config.title;
        },
        createIframe: function() {
            let iframe = `<iframe src="${this.privateState.qolembedURL}/embed.html?m=${this.sharedState.metricId}&y=${this.sharedState.year}&s=${this.sharedState.selected.join(',')}&t=${encodeURIComponent(this.privateState.title)}" style="width: 500px; height: 500px; border: 1px solid #595959"></iframe>`;
            return iframe;
        }
    },
    filters: {
        createIframe: function() {
            let iframe = `<iframe src="${this.privateState.qolembedURL}/embed.html?m=${this.sharedState.metricId}&y=${this.sharedState.year}&s=${this.sharedState.selected.join(',')}&t=${encodeURIComponent(this.privateState.title)}" style="width: 500px; height: 500px; border: 1px solid #595959"></iframe>`;
            return iframe;
        }
    }
}
</script>

<style lang="css">
.embedcode {
  padding: 15px;
  width: 100%;
}
.embedcode div {
  width: 100%;
}
.embedcode h3 {
  font-size: 1.2em;
  margin: 0 0 10px;
  line-height: 1em;
}
.embedcode #embed-textarea .mdl-textfield__label,
.embedcode #embed-title .mdl-textfield__label {
  top: 4px;
  color: #3f51b5;
  font-size: 12px;
}
.embedcode #embed-textarea .mdl-textfield__input {
  font-size: 12px;
}
</style>
