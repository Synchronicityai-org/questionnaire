import React from 'react';
import { useStore } from './store';
import { useParams, useNavigate } from 'react-router-dom';
import arrow from '/Images/arrow.png';
import arrowB from '/Images/arrowB.png';
import { Link } from 'react-router-dom';
function Country() {
  const { filteredCountries, theme } = useStore();
  const { name } = useParams();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={`${theme === 'light' ? 'bg-lightBackground' : 'bg-darkBackground'} min-h-screen p-10`}>
        <div className={`${theme === 'light' ? 'bg-light-elements' : 'bg-dark-elements'} flex flex-wrap p-2 bg-black w-fit justify-evenly content-center rounded-lg cursor-pointer shadow-lg`} onClick={handleBackClick}>
                <img src={theme === 'light' ? arrowB : arrow} alt='arrow' className=''></img>
                <span className={theme === 'light' ? 'text-dark' : 'text-light'}>Back</span>
        </div>
        <div className='mt-10'>
        {filteredCountries.map(country => (
            country.name === name ? (
            <div key={country.name} className='flex'>
               <div className='w-2/4 h-fit'> <img src={country.flags.svg} alt={country.name} className='w-2/3'/></div>
                <div className={`${theme === 'light' ? 'text-dark' : 'text-light'} w-2/4`}>
                    <h1 className='text-2xl mb-5 font-bold'>{country.name}</h1>
                    <div className='flex'>
                        <ul className='text-m mr-5'>
                        <li><span className='mr-4 text-5l font-bold'>Native Name:</span>{country.nativeName}</li>
                        <li><span className='mr-4 text-5l font-bold'>Population:</span> {country.population}</li>
                        <li><span className='mr-4 text-5l font-bold'>Region:</span> {country.region}</li>
                        <li><span className='mr-4 text-5l font-bold'>Sub Region:</span> {country.subregion}</li>
                        <li><span className='mr-4 text-5l font-bold'>Capital:</span>{country.capital}</li>
                        </ul>
                        <ul className='text-m ml-5'>
                        <li><span className='mr-4 text-5l font-bold'>Top Level Domain:</span>{country.topLevelDomain}</li>
                        <li><span className='mr-4 text-5l font-bold'>Currencies:</span>{country.currencies.map(currency => currency.name).join(', ')}</li>
                        <li><span className='mr-4 text-5l font-bold'>Languages:</span>{country.languages.map(language => language.name).join(', ')}</li>
                        </ul>
                    </div>
                <div className='mt-5 flex'>
                    <span className='mr-5 text-5l font-bold'>Border Countries: </span>
                    <ul className='flex flex-wrap'>
                    {country.borders && country.borders.length > 0 ? (
                        country.borders.map((border, index) => (
                            filteredCountries.map(country =>(
                                country.alpha3Code === border ? (<Link to={`/${country.name}`}><li key={index} className={`${theme === 'light' ? 'bg-light-elements' : 'bg-dark-elements'} mr-5 mb-2 shadow-lg p-2`}>{country.name}</li></Link>) : null
                            ))
                        ))
                    ) : (
                        <li>No Border Countries</li>
                    )}
                    </ul>
                </div>
                </div>
            </div>
            ) : null
        ))}
        </div>
    </div>
  );
}

export default Country;
