import React, { useContext, useEffect, useState } from 'react'
import PokeAPI, { INamedApiResource, IPokemon } from 'pokeapi-typescript'
import { getIdFromUrl, isOG } from '../../utils'

export enum Field {
  favourite = 'favourite',
  pokemonType = 'pokemonType'
}

type Filters = { [key in Field]: FilterValue }
type FilterValue = boolean | string | string[] | undefined

interface PokemonContextData {
  pokemon: INamedApiResource<IPokemon>[]
  query: string
  search: (query: string) => void
  favourites: string[]
  addFavourite: (pokemon: INamedApiResource<IPokemon>) => void
  removeFavourite: (pokemon: INamedApiResource<IPokemon>) => void
  filters: Filters
  addFilter: (field: Field, value: FilterValue) => void
  removeFilter: (field: Field) => void
  populatePokemonType: (pokemonObject: PokemonTypeObject) => void;
}

export const PokemonContext = React.createContext<PokemonContextData | undefined>(undefined)

interface PokemonProviderProps {
  children: React.ReactNode
}

export enum PokemonType {
  grass = "grass",
  fire = "fire",
  water = "water",
  bug = "bug",
  normal = "normal",
  flying = "flying",
  dark = "dark",
  electric = "electric",
  dragon = "dragon",
  poison = "poison",
  fairy = "fairy",
  fighting = "fighting",
  ghost = "ghost",
  ground = "ground",
  ice = "ice",
  psychic = "psychic",
  rock = "rock",
  steel = "steel",
}

type PokemonTypes = Partial<keyof typeof PokemonType>;
export type PokemonTypeObject = Record<string, PokemonTypes[]>;

export enum PokemonStat {
  hp = "hp",
  attack = "attack",
  defense = "defense",
  specialAttack = "special-attack",
  specialDefense = "special-defense",
  speed = "speed"
}

const PokemonProvider: React.FC<PokemonProviderProps> = ({ children }) => {
  const [data, setData] = useState<INamedApiResource<IPokemon>[]>()
  const [pokemon, setPokemon] = useState<INamedApiResource<IPokemon>[]>()
  const [favourites, setFavourites] = useState<string[]>([])
  const [query, setQuery] = useState<string>('')
  const [filters, setFilters] = useState<Filters>({} as Filters)
  const [error, setError] = useState<any>()
  const [pokemonTypeStore, setPokemonTypeStore] = useState({} as PokemonTypeObject)

  useEffect(() => {
    fetchPokemon()
  }, [])

  useEffect(() => {
    filterData()
  }, [filters, query, data])

  const filterData = async () => {
    if (!data) {
      return
    }

    let filteredData = [...data]
    const fields = Object.keys(filters) as Field[]
    for (const field of fields) {
      switch (field) {
        case Field.favourite: {
          const value = filters[field]
          if (value) {
            filteredData = filteredData.filter((pokemon) => favourites.includes(pokemon.name))
          } else if (value === false) {
            filteredData = filteredData.filter((pokemon) => !favourites.includes(pokemon.name))
          }
          break
        }
        case Field.pokemonType: {
          const selectedTypes = filters[field];
          if (!Array.isArray(selectedTypes)) break;

          const store = new Set<INamedApiResource<IPokemon>>();

          filteredData.forEach((data) => {
            const availablePokemonTypeValues = pokemonTypeStore[data.name];
            
            if (availablePokemonTypeValues.length > 0) {
              availablePokemonTypeValues.forEach((value) => {
                if (selectedTypes.includes(value)) store.add(data);
              });
            }
          });

          filteredData = Array.from(store)
        }
      }
    }

    if (query) {
      filteredData = filteredData.filter((pokemon) => pokemon.name.includes(query))
    }

    filteredData.sort((a, b) => {
      const aId = getIdFromUrl(a.url)
      const bId = getIdFromUrl(b.url)

      if (aId > bId) {
        return 1
      } else {
        return -1
      }
    })

    setPokemon(filteredData)
  }

  const fetchPokemon = async () => {
    try {
      const response = await PokeAPI.Pokemon.list(150, 0)
      setData(response.results)
      setPokemon(response.results)
    } catch (error) {
      setError(error)
    }
  }

  const search = (query: string) => {
    setQuery(query)
  }

  function addFavourite(pokemon: INamedApiResource<IPokemon>) {
    setFavourites([...favourites, pokemon.name])
  }

  function removeFavourite(pokemon: INamedApiResource<IPokemon>) {
    setFavourites(favourites.filter((favourite) => favourite !== pokemon.name))
  }

  function addFilter(field: Field, value: FilterValue) {
    const newFilters = {...filters, [field]: value}
    setFilters(newFilters)
  }

  function removeFilter(field: Field) {
    const newFilters = {...filters}
    newFilters[field] = undefined
    setFilters(newFilters)
  }

  function populatePokemonType(pokemon: PokemonTypeObject) {
    setPokemonTypeStore((currentValues) => ({ ...currentValues, ...pokemon }));
  }

  if (error) {
    return <div>Error</div>
  }

  if (!pokemon) {
    return <div></div>
  }

  return (
    <PokemonContext.Provider value={{
      pokemon,
      query,
      search,
      favourites,
      addFavourite,
      removeFavourite,
      filters,
      addFilter,
      removeFilter,
      populatePokemonType,
    }}>
      {children}
    </PokemonContext.Provider>
  )
}

export const usePokemonContext = () => {
  const pokemon = useContext(PokemonContext);

  if (!pokemon) {
    throw Error('Cannot use `usePokemonContext` outside of `PokemonProvider`');
  }

  return pokemon;
}

export default PokemonProvider;