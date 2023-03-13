<template>
  <h1>Hey</h1>
  <div v-if="countries">
    <ul>
      <li v-for="country in countries">
        <NuxtLink :to="`/country/${country.cca3}`">{{ country.name.common }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Country } from '~~/types/country';

export default defineNuxtComponent({
  setup () {
    const { data: countries, suspense } = useQuery('countries', () => $fetch<Country[]>('https://restcountries.com/v3.1/all'))

    onServerPrefetch(async () => {
      await suspense
    })
    return { countries }
  }
})
</script>