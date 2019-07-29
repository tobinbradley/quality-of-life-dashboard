<template>
 <svg data-v-1b968762="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24" role="img"
       aria-hidden="true" class="icon" @click="togglePrint">
    <path
          d="M18,3H6V7H18M19,12C18.45,12 18,11.55 18,11C18,10.45 18.45,10 19,10C19.55,10 20,10.45 20,11C20,11.55 19.55,12 19,12M16,19H8V14H16M19,8H5C3.34,8 2,9.34 2,11V17H6V21H18V17H22V11C22,9.34 20.66,8 19,8Z">
    </path>
  </svg>
</template>

<script>
  import setMode from '../js/displayMode'
  
  export default {
    name: 'print-toggle',
    methods: {
      togglePrint() {
        if (this.$store.state.displayMode !== 'print') {
          this.$store.commit("setDisplayMode", setMode('print'))
        }
        else {
          this.$store.commit("setDisplayMode", setMode())
        }
      }
    }
  }

</script>

<style lang="scss" scoped>

</style>