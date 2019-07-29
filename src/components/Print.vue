<template>
  <div>

    <v-card style="margin: 18px auto; width: 7.8in;" class="no-print">

      <v-card-text>
        <p class="text--primary">
          There are some things you can customize before you print:
        </p>

        <p>
          <ul>
            <li>You can customize the maps by panning or zooming to the
          desired location before printing.</li>
            <li>The title "Report" can be changed by clicking on it and editing
              the text as you see fit.
            </li>
            <li>
              Showing the data table is optional. If the data table is shown, you can
              also specify the number of rows show. Note showing the data table may mean each metric
              will print on more than one page.
            </li>
          </ul>
        </p>

        <p class="text--primary">
          When ready,
          hit the Print button, or hit Close to go back to the Explorer.
        </p>
      </v-card-text>

      <v-card-actions style="display: flex; justify-content: center;">
        <v-btn color="pink" dark @click="print">
          <v-icon left>{{ mdiPrinter }}</v-icon>
          Print</v-btn>
        <v-btn color="primary" @click="close">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>


    <!-- print header -->
    <v-card
      class="grid-item"
      style="margin: 0 auto"
    >

      <v-card-text class="print-header">
        <div style="text-align: center">
          <img src="../assets/report.jpg">
          <h1 contenteditable="true">Report</h1>
        </div>
        <div class="blather">
          <p class="text--primary">
            The {{ site.title }} is an interactive online tool to help neighborhoods, government leaders and staff, businesses, community organizations, new residents and others learn more about our county and the diverse neighborhoods within it.  The Explorer features over 80 variables that reflect you, the places you live and work, and collectively, our community.
          </p>
          <p class="text--primary">
            On these pages, you’ll find information about the selected area’s social, housing, economic and environmental conditions.  Check out the Explorer online to learn more about what’s happening, see trends over time, and connect to resources to take action on the issues that matter to you.
          </p>
          <p class="text--primary">
            Learn More.  Take Action.  Create Change.
          </p>
        </div>
      </v-card-text>

    </v-card>

  </div>
</template>

<script>
  import setMode from '../js/displayMode'
  import { mdiPrinter } from '@mdi/js'

  export default {
    name: 'print',
    data() {
      return {
        mdiPrinter: mdiPrinter
      }
    },
    computed: {
      site() {
        return this.$store.state.siteConfig
      }
    },
    methods: {
      print() {
        window.print()
      },
      close() {
        this.$store.commit("setDisplayMode", setMode())
      }
    },
  }
</script>

<style lang="scss" scoped>
.print-header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

h1 {
  line-height: 1.2em;
  margin: 0 0 25px;
}

.blather {
  column-count: 2;
  column-gap: 20px;
}
</style>