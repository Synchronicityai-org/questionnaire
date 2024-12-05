import React, { useEffect } from 'react';
import dark from '/Images/dark.png';
import light from '/Images/light.png';
import { useStore } from './store';
import Countries from './countries';
import Country from './country'
import { BrowserRouter as Router, Route, Routes } from 'react-router'

function App() {
  const { fetchCountries, theme, setTheme} = useStore();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <div className={`${theme === 'light' ? 'bg-lightBackground' : 'bg-darkBackground'} min-h-screen`}>
      <div className={`${theme === 'light' ? 'bg-light' : 'bg-dark'} flex h-fit p-5`}>
        <h1 className={`${theme === 'light' ? 'text-lightText' : 'text-light'} text-3xl w-2/3`}>Where in the world?</h1>
        <div className='flex flex-wrap justify-end w-1/3 content-center'>
          <img src={theme === 'light' ? dark : light} alt="dark theme" className='w-[25px] h-[25px]' />
          <span className={`${theme === 'light' ? 'text-lightText' : 'text-light'} cursor-pointer`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Countries />} />
          <Route path="/:name" element={<Country />} />
        </Routes>
    </Router>
    </div>
  );
}

export default App;