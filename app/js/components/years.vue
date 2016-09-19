<template lang="html">
    <ul v-if="sharedState.metric.years.length > 1" id="yearControl">
        <template v-for="y in sharedState.metric.years">
        <li v-if="y == sharedState.year" class="selected">{{y}}</li>
        <li v-else v-on:click="setYear(y)">{{y}}</li>
        </template>
    </ul>
    <div class="clearer"></div>
</template>

<script>
export default {
    name: 'sc-years',
    methods: {
        setYear: function(year) {
            this.sharedState.year = year;
        }
    }
};
</script>

<style lang="css">
#yearControl {
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
        cursor: pointer;
        display: inline-block;
        padding-right: 10px;
        transition: all 0.2s ease-in;
        &:hover {
            /*color: #ff4081;*/
            text-shadow: 1px 0px 20px #ff4081;
        }
    }
    .selected {
        /*font-size: 1.2em;*/
        color: #ff4081;
        font-weight: bold;
    }
    .clearer {
        height: 0;
        clear: both;
    }
}
</style>
