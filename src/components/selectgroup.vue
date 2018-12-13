<template>
  <p v-if="selectGroup && typeof selectGroup === 'object'">
    Approximate: 
    <template v-for="group, key, index in selectGroup">
    <a href="javascript:void(0)" class="selectgroup-link" v-bind:id="`selectgroup-${index}`">{{key}}</a>
    <ul class="mdl-menu mdl-menu--bottom-left mdl-js-menu" v-bind:for="`selectgroup-${index}`">                       
        <li class="mdl-menu__item" v-for="item, key, index in group" @click="select(item)">{{key}}</li>
    </ul>
    </template>
  </p>
</template>

<script>
export default {
  name: 'Selectgroup',
  methods: {
    select: function(item) {
      this.sharedState.selected = item;
      this.sharedState.zoomNeighborhoods = item.slice(0);
    }
  }
}
</script>
