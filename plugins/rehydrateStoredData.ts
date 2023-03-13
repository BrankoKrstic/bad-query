export default defineNuxtPlugin((nuxt) => {
  const querySnapshot = useState<{ [key: string]: any } | null>('query-snapshot')

  if (process.server) {
    nuxt.hooks.hook('app:rendered', () => {
      querySnapshot.value = getDehydratedQueryMap()
    })
  }

  if (process.client && querySnapshot.value) {
    nuxt.hooks.hook('app:created', () => {
      rehydrateMap(querySnapshot.value!)
    })
  }
})