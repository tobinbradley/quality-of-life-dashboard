<template lang="html">
    <div>
        <ul v-show="sharedState.metric.years.length > 1">
            <template v-for="y in sharedState.metric.years">
            <li v-if="y == sharedState.year" class="selected">{{y}}</li>
            <li v-else v-on:click="setYear(y)">{{y}}</li>
            </template>
        </ul>
        <div class="clear:both"></div>
    </div>
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

<style lang="css" scoped>
ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}
li {
    cursor: pointer;
    display: inline-block;
    padding-right: 10px;
    transition: all 0.2s ease-in;
}
li:hover {
    text-shadow: 1px 0px 20px #ff4081;
}
.selected {
    color: rgb(211, 45, 101);
    font-weight: bold;
}
.clearer {
    height: 0;
    clear: both;
}
</style>
