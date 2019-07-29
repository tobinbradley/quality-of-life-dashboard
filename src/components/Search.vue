<template>
  <v-layout wrap>
    <v-flex md5>
      <v-autocomplete
        v-model="model"
        :items="items"
        :loading="isLoading"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        hide-details
        item-text="label"
        item-value="API"
        label="Search"
        :filter="goFilter"
        return-object
        clearable
      ></v-autocomplete>
    </v-flex>
    <v-flex md1></v-flex>
    <v-flex md5>
      <v-select v-if="groups.length > 0"
        @change="selectGroup"
        :items="groups"
        label="Geography (approximate)"
        hide-details
        clearable
      ></v-select>
    </v-flex>
  </v-layout>
</template>

<script>
  export default {
    props: {
      value: Boolean,
      metricId: String,
      geometry: Object
    },
    data() {
      return {
        groups: [],
        descriptionLimit: 60,
        entries: [],
        isLoading: false,
        model: null,
        search: null,
      }
    },
    computed: {
      dataOptions() {
        return this.$store.state.dataOptions
      },
      geojson() {
        return this.$store.getters.geojsonName(this.metricId)
      },
      geojsonOptions() {
        return this.dataOptions.geojson.filter(elem => { return elem.layer === this.geojson })[0]
      },
      items () {
        return this.entries
      }
    },
    mounted () {
      if (this.geojsonOptions.selectGroups) {
        this.groups = this.geojsonOptions.selectGroups.map(elem => { return elem.name })
      }
    },
    watch: {
      search (newValue, oldValue) {
        if (!newValue || newValue === oldValue || this.isLoading) return

        this.isLoading = true

        // geometry id matches
        let geomMatches = this.geometry.features.filter(el => { return el.properties.id.toUpperCase().indexOf(newValue.toUpperCase()) !== -1 })
        this.entries = geomMatches.map(el => { return { label: `${this.geojsonOptions.name} ${el.properties.id}`, id: [el.properties.id] } })

        // build urls
        const urls = []
        this.dataOptions.searchPaths.forEach(search => {
          let val = search.searchVal(newValue) || newValue
          urls.push(search.url + val)
        })

        const promises = urls.map(url => fetch(url).then(y => y.json()))
        Promise.all(promises)
          .then(results => {
            results.forEach((result, idx) => {
              let final = result
              if (this.dataOptions.searchPaths[idx].format) {
                final = this.dataOptions.searchPaths[idx].format(result)
              }
              this.entries.push(...final)
            })
          })
          .then(e => {
            this.isLoading = false
          })
          .catch(error => {
            this.isLoading = false
            console.log(error)
          })

      },
      model(val) {
        if (val) {
          if (val.id) {
            this.$store.commit("addSelected", { geography: this.geojson, id: val.id })
          }
          if (val.lnglat) {
            this.$emit('geocode', val)
          }
        }
      }
    },
    methods: {
      selectGroup(value) {
        if (!value) return false
        const group = this.geojsonOptions.selectGroups.filter(elem => { return elem.name === value })[0]
        fetch(group.ids)
          .then((resp) => resp.json()) // Transform the data into json
          .then((data) => {
            if (group.filter) data = group.filter(data)
            this.$store.commit("setSelected", { geography: this.geojson, selected: data })
            this.$emit('geocode', {id: data})
          })
      },
      goFilter() {
        return true
      }
    }
  }
</script>

<style scoped>
.v-text-field {
  padding-top: 0;
  margin-top: 0;
}
</style>