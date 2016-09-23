<template lang="html">
    <div v-if="privateState.qolembedURL" class="mdl-typography--text-center mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet flexcontainer">
        <div v-if="sharedState.metric.config" class="embedcode">
            <h3>Embed This Map</h3>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" v-mdl>
                <input class="mdl-textfield__input" type="text" id="embedTitle" value="{{sharedState.metric.config.title}}" v-model="privateState.title" autocomplete="off">
                <label class="mdl-textfield__label" for="embedTitle">Map Title</label>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" id="embed-textarea" v-mdl>
                <textarea class="mdl-textfield__input" type="text" rows= "5" id="embedIframeCode" onclick="this.select()" v-on:keypress.stop.prevent autocomplete="off">{{privateState.title | createIframe}}</textarea>
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
        }
    },
    filters: {
        createIframe: function() {
            let iframe = `<iframe src="${this.privateState.qolembedURL}/embed.html?m=${this.sharedState.metricId}&y=${this.sharedState.year}&b=${this.sharedState.mapBounds.join(',')}&s=${this.sharedState.selected.join(',')}&t=${encodeURIComponent(this.privateState.title)}" style="width: 500px; height: 500px; border: 1px solid #595959"></iframe>`;
            return iframe;
        }
    }
}
</script>

<style lang="css">
    .embedcode {
        padding: 20px;
        width: 100%;
        div {
            width: 100%;
        }
        h3 {
            font-size: 1.2em;
            margin: 0;
        }
    }
    #embed-textarea {
        .mdl-textfield__label {
            top: 4px;
            color: rgb(63,81,181);
            font-size: 12px;
        }
        .mdl-textfield__input {
            font-size: 12px;
        }
    }
</style>
