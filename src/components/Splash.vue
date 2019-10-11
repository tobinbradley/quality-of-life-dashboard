<template>
  <v-dialog v-model="dialog" persistent max-width="450">
    <v-card>
      <v-card-title class="headline">Welcome to the new Dashboard!</v-card-title>
      <div class="d-flex flex-no-wrap justify-space-between">

        <v-avatar
          class="ma-3"
          size="150"
          tile
        >
          <v-img src="../assets/qolethumb.jpg"></v-img>
        </v-avatar>
        <div>
          <v-card-text>
            The <a href="https://mcmap.org/qolexplorer" target="_blank">Quality of Life Explorer</a>
            is still available.
          </v-card-text>
          <v-card-text>
            In future visits you can find a link to the Explorer in the navigation bar
            activated by the <v-icon color="primary">{{ mdiMenu }}</v-icon>  in the top left corner of
              the screen.
          </v-card-text>
        </div>
      </div>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn href="https://mcmap.org/qolexplorer" target="_blank" color="primary" text>Launch Quality of Life Explorer</v-btn>
        <v-btn color="primary" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiMenu } from '@mdi/js'

export default {
  name: 'splashscreen',
  data() {
    return {
      mdiMenu: mdiMenu,
      dialog: localStorage.getItem("skipsplash") ? false : true
    }
  },
  methods: {
    closeDialog() {
      localStorage.setItem("skipsplash", true)
      this.dialog = false
    }
  }
}
</script>

<style>

</style>