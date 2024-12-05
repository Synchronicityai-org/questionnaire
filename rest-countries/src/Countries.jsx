import React from 'react'
import {useStore} from './store';
import search from '/Images/search.png';
import searchW from '/Images/searchW.png';
import { Link } from 'react-router-dom';

function Countries() {
    const {input, setInput, filteredCountries, setRegion, theme} = useStore()
  return (
    <div >
      <div className='flex p-5 justify-between'>
        <div className={`${theme === 'light' ? 'bg-light' : 'bg-dark'} flex flex-wrap border-0  w-fit h-fit content-center p-3`}>
          <img src={theme === 'light' ? search : searchW} alt='search button' className='w-[25px] h-[25px] mr-5' />
          <input
            className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'} outline-none`}
            type='text'
            placeholder='Search for a country ...'
            value={input}
            onChange={(e) => setInput(e.target.value)} 
          />
        </div>
        <select className={`${theme === 'light' ? 'bg-light-elements text-dark' : 'bg-dark-elements text-light'} p-2 outline-none`} onChange={(e)=>setRegion(e.target.value)}>
          <option value="All">Filter by Region</option>
          <option value="Africa">Africa</option>
          <option value="America">America</option>
          <option value="Asia">Asia</option>
          <option value="Europe" >Europe</option>
          <option value="Oceania">Oceania</option>
        </select>
      </div>

      <div className={filteredCountries.length > 0 ? 'grid grid-cols-4 gap-12 p-5' : ' '}>
        {filteredCountries.length > 0 ? (
          filteredCountries.map((country) => (
            <div key={country.name} className={`${theme === 'light' ? 'bg-light-elements text-dark' : 'bg-dark-elements text-light'} shadow-lg rounded-lg`} >
              <Link to={`/${country.name}`}>
              <img
                src={country.flags.svg}
                alt={`${country.name} flag`}
                className='w-fit h-fit'
              />
              <h2 className='p-3 text-2xl'>{country.name}</h2>
              <ul className='p-3'>
                <li>Population: {country.population}</li>
                <li>Region: {country.region}</li>
                <li>Capital: {country.capital}</li>
              </ul>
              </Link>
            </div>
          ))
        ) : (
          <div className={`${theme === 'light' ? 'text-dark' : 'text-light'} text-3xl text-center w-full`}>No countries found</div>
        )}
      </div>
    </div>
  )
}

export default Countries;
