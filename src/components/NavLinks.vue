<template>
  <v-navigation-drawer
      v-model="$parent.linksDrawer"
      fixed
      temporary
    >
      <v-list-item class="appTitle">
        <v-list-item-content>
          <v-list-item-title class="nav-title">
            <img src="../assets/logo.svg" alt="" width="100%">
            <a href="./">{{ site.title }}</a>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense v-for="item in site.navLinks" :key="item.title">
        <v-list-item link :href="item.url" target="_blank">
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div style="text-align: center;">
          <Share />
          <Contact v-if="site.contactForm" />
          <v-btn v-if="site.helpUrl" text @click="showHelp=true">
            Help
          </v-btn>

        </div>
      </template>

      <Help v-model="showHelp" />

    </v-navigation-drawer>
</template>

<script>
  import Contact from './Contact'
  import Help from './Help'
  import Share from './Share'

  export default {
    name: 'navlinks',
    components: {
      Contact,
      Help,
      Share
    },
    data () {
      return {
        showHelp: false
      }
    },
    computed: {
      site() {
        return this.$store.state.siteConfig
      }
    },
  }
</script>

<style lang="scss" scoped>
.nav-title {
  text-overflow: inherit;
  white-space: inherit;
}
.appTitle {
  text-align: center;

  a {
    text-decoration: none;
    font-weight: 500;
  }
}
</style>