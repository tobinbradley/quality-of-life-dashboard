<template>
    <v-navigation-drawer
      v-model="show"
      fixed
      temporary
      right
    >
      <v-list-item>
        <v-list-item-avatar>
           <v-icon class="pink white--text">{{ mdiPlus }}</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>Add Data</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item>
        <v-select
        v-model="filterBy"
        :items="tags"
        attach
        chips
        label="Filter by..."
        multiple
        clearable
        menu-props="closeOnClick"
        aria-label="Filter Metrics"
        ></v-select>
      </v-list-item>

      <v-list dense>

        <v-list-item
          v-for="item in dataConfig"
          :key="item.metric"
        >

          <v-list-item-content>
            <v-checkbox
              :label="item.title"
              v-model="metric"

              :value="item.metric"
              height=0
            ></v-checkbox>
            <v-icon v-if="site.whatsnew.indexOf(item.metric) !== -1" class="new" color="pink">{{ mdiNewBox }}</v-icon>
          </v-list-item-content>
         </v-list-item>

      </v-list>
    </v-navigation-drawer>

</template>

<script>
  import { mdiPlus, mdiNewBox } from '@mdi/js'

  export default {
    name: 'dataselector',
    props: {
      value: Boolean
    },
    data: () => ({
        filterBy: [],
        mdiPlus: mdiPlus,
        mdiNewBox: mdiNewBox
    }),
    computed: {
      show: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      },
      metric: {
        get() {
          return this.$store.state.metric
        },
        set(value) {
          this.$store.commit("setMetric", value)
        }
      },
      dataConfig() {
        if (this.filterBy.length > 0) {
          return this.$store.state.dataConfig.filter(el => {
            const uniques = [...new Set([...el.tags, ...this.filterBy])]
            return uniques.length !== this.filterBy.length + el.tags.length
          })
        }
        return this.$store.state.dataConfig
      },
      tags() {
        let tags = []
        this.$store.state.dataConfig.forEach(el => {
          tags = [...new Set([...tags, ...el.tags])]
        })

        return tags.sort()
      },
      site() {
        return this.$store.state.dataOptions
      }
    }
  }
</script>

<style lang="scss" scoped>

.new {
  position: absolute;
  top: 0px;
  left: 0;
}

</style>
