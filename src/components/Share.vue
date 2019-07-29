<template>
  
  <div>
    <v-btn text icon small @click="shareTwitter">
      <v-icon>{{ mdiTwitter }}</v-icon>
    </v-btn>
    <v-btn text icon small @click="shareFacebook">
      <v-icon>{{ mdiFacebook }}</v-icon>          
    </v-btn> 
    <v-btn text icon small @click="shareLinkedin">
      <v-icon>{{ mdiLinkedin }}</v-icon>
    </v-btn> 
    <v-btn text icon small @click="shareLinkedin">
      <v-icon>{{ mdiGithubFace }}</v-icon>
    </v-btn>         
  </div>
                                             

</template>

<script>
  import { mdiFacebook, mdiTwitter, mdiLinkedin, mdiGithubFace } from '@mdi/js'

  export default {
    name: 'share',
    data() {
      return {
        dialog: false,
        mdiFacebook: mdiFacebook,
        mdiTwitter: mdiTwitter,
        mdiLinkedin: mdiLinkedin,
        mdiGithubFace: mdiGithubFace
      }
    },
    computed: {
      url() {
        return window.location.href
      },
      site() {
        return this.$store.state.siteConfig
      }
    },
    methods: {
      shareTwitter() {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(this.url)}&text=${encodeURIComponent(`Check this out on the ${this.site.title}!`)}&hashtags=${encodeURIComponent('opendata')}`)
      },
      shareFacebook() {
        window.open(`https://www.facebook.com/sharer.php?u=${this.url}`)
      },
      shareLinkedin() {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${this.url}&title=${encodeURIComponent(this.site.title)}&summary=${encodeURIComponent(`Check this out on the ${this.site.title}!`)}`)
      }
    }
  }
</script>

<style scoped>
button {
  margin: 5px;
}
</style>