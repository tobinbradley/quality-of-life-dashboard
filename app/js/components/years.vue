<template lang="html">
    <div id="years">
        <div class="flex-container">
            <div v-if="sharedState.metric.years.length > 1" class="flex-left">
                <div class="play-button" v-on:click="play">
                    <div class="play-button__triangle"></div>
                </div>
            </div>
            <div v-if="sharedState.metric.years.length > 1" class="flex-center">
                <input id="yearslider" type="range" v-bind:min="sharedState.metric.years[0]"
                    v-bind:value="sharedState.year" v-bind:max="sharedState.metric.years[sharedState.metric.years.length - 1]"
                    v-on:change="changeYear" step="1" list="ticks">
                <datalist id="ticks">
                    <option v-for="year in sharedState.metric.years">
                        {{ year }}
                    </option>
                </datalist>
            </div>
            <div class="flex-right">
                <h3>{{ sharedState.year }}</h3>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'sc-year',
    methods: {
        changeYear: function(elem) {
            let closest = this.getClosest(this.sharedState.metric.years, elem.srcElement.value);
            this.sharedState.year = elem.srcElement.value = closest;
        },
        getClosest: function(arr, val) {
            return arr.reduce(function (prev, curr) {
                return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
            });
        },
        play: function() {
            let _this = this;
            this.sharedState.metric.years.forEach(function(item, index, array) {
                setTimeout( (function( index ) {
                    return function() {
                        _this.sharedState.year = array[index];
                    };
                }( index )), (2000 * index) );
            });
        }
    }
}
</script>

<style lang="css" scoped>
#years {
    color: rgb(210, 210, 210);
    padding: 5px;
    display: inline-block;
    width: 100%;
}
.flex-container {
    display: flex;
    align-items: center;
}
.flex-left, .flex-right {
    width: 20px;
}
.flex-center {
    flex-grow: 1;
    padding: 0 10px;
}
#yearslider {
  width: 100%;
}
h3 {
    margin: 0;
    font-size: 1.1em;
}
.play-button {
  position: relative;
  height: 1.4em;
  width: 1.4em;
  box-shadow: 0 0 0 2px rgb(210, 210, 210);
  border-radius: 50%;
  cursor: pointer;
  transition: 0.6s;
}
.play-button:hover {
    box-shadow: 0 0 0 3px #176ADF;
}
.play-button__triangle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-40%, -50%);
  z-index: 0;
  border: solid rgb(210, 210, 210);
  border-right-width: 0;
  border-left-width: 12px;
  border-top-width: 7px;
  border-bottom-width: 8px;
  border-top-color: transparent;
  border-bottom-color: transparent;
  height: 0;
  width: 0;
  transition: 0.6s;
}
</style>
