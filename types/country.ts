export type Country = {
  name: {
    common: string,
    official: string,
    nativeName?: {
      [key: string]: {
        common: string,
        official: string,
      }
    }
  },
  tld: string[]
  cca2: string
  ccn3: string
  cca3: string
  cioc: string
  subregion: string
  region: string
  population: number
  capital: string[]

  languages: {
    [key: string]: string
  }
  flags: {
    png: string
    svg: string
    alt: string
  },
  translations: {
    [key: string]: {
      official: string,
      common: string
    }
  },
  latlng: [number, number],
  landlocked: boolean
  timezones: string[]
}