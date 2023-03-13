<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-if="country">
    <h1>{{ country.name.common }}</h1>
  </div>
</template>

<script lang="ts">
import { Country } from '~~/types/country';


export default defineNuxtComponent({
  setup () {
    const route = useRoute()
    const { data: country, suspense, loading } = useQuery(`country-${route.params.id}`, async () => {
      const data = await $fetch<Country[]>(`https://restcountries.com/v3.1/alpha/${route.params.id}`)
      return data[0]!
    },
    // Preloads data from countries index. Uncomment to get data immediately upon navigation
    (dataAccessor) => dataAccessor.getData<Country[]>('countries')?.find(c => c.cca3 === route.params.id)
    )
    onServerPrefetch(async () => {
      await suspense
    })
    return { country, loading }
  }
})
</script>