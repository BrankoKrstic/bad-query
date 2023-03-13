
type StoredDataFull<T> = {
  data: Ref<T | undefined>,
  error: Ref<boolean>
  loading: Ref<boolean>
  refresh: () => Promise<void>
  suspense: Promise<void>
  fetching: Ref<boolean>
}

export type StoredData<T> = Omit<StoredDataFull<T>, "refresh" | "suspense"> & Partial<StoredDataFull<T>>

let dataMap: { [key: string]: StoredData<any> } = {}

type DataAccessor = {
  getData: <T>(key: string) => T | undefined 
}

const dataAccessor: DataAccessor = {
  getData: <T>(key: string) => {
    return dataMap[key]?.data.value
  }
} 

// can't serialize functions or refs so these functions are used to get state when server render is finished to the client app
export function getDehydratedQueryMap () {
  return Object.keys(dataMap).reduce((obj, curr) => {
    return {...obj, 
      [curr]: {
        data: dataMap[curr].data.value,
        loading: dataMap[curr].loading.value,
        error: dataMap[curr].error.value,
        fetching: dataMap[curr].fetching.value,
      }}
  }, {} as { [key: string]: any})

}

export function rehydrateMap (dehydratedMap: { [key: string]: any }) {
  Object.keys(dehydratedMap).forEach(key => {
    dataMap[key] = {
      data: ref(dehydratedMap[key].data),
      error: ref(dehydratedMap[key].error),
      loading: ref(dehydratedMap[key].loading),
      fetching: ref(dehydratedMap[key].fetching)
    }
  })
}


// overloads because only the instance that receives the query handler is guaranteed to get the refresh function and suspense promise
function useQuery<T>(key: string): StoredData<T>
function useQuery<T>(key: string, queryHandler: () => Promise<T>, preloadData?: (dataAccessor: DataAccessor) => T): StoredDataFull<T>
function useQuery<T>(key: string, queryHandler?: () => Promise<T>, preloadData?: (dataAccessor: DataAccessor) => T | undefined): StoredData<T> | StoredDataFull<T> {
  // generate blank refs 
  if (!dataMap[key]) {
    dataMap[key] = {
      data: ref(),
      error: ref(false),
      loading: ref(false),
      fetching: ref(false)
    }
  }

  const data = dataMap[key] as StoredData<T>;

  // if (data.refresh && queryHandler) {
  //   throw new Error("Can't have multiple query handlers");
  // }

  if (queryHandler) {
    data.refresh = async function () {
      data.fetching.value = true
      data.error.value = false
      if (preloadData) {
        const dataToPreload = preloadData(dataAccessor)

        if (dataToPreload) {
          data.data.value = dataToPreload
        } else {
          data.loading.value = true
        }
      } else {
        data.loading.value = true
      }
      try {
        data.data.value = await queryHandler()
      } catch (err) {
        data.error.value = true
      } finally {
        data.loading.value = false
        data.fetching.value = false
      }
    }

    if (!data.data.value) {
      // suspense used to pause the server rendered inside onServerPrefetch 
      data.suspense = data.refresh()
    }
  }

  return data
}

export default useQuery