import { create } from "zustand";
const store = (set, get) => ({
  countries: [],
  input: '',
  region: 'All',
  theme:'light',
  filteredCountries: [],
  setTheme: ()=> {
    if(get().theme === 'light'){
        set({theme: 'dark'})
    }
    else {
        set({theme: 'light'})
    }
  }, 
  setInput: (inputValue) => {
    set({ input: inputValue });
    get().filterCountries(inputValue, get().region);
  },
  setRegion: (value) => {
    set({ region: value });
    get().filterCountries(get().input, value);
  },
  fetchCountries: async () => {
    try {
      const response = await fetch('/data.json');
      const countries = await response.json();
      set({ countries });
      get().filterCountries(get().input, get().region);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  },
  filterCountries: (input, region) => {
    const countries = get().countries;
    let filtered = countries;
    if (input) {
      filtered = filtered.filter(country =>
        country.name.toLowerCase().includes(input.toLowerCase())
      );
    }
    if (region && region !== 'All') {
      filtered = filtered.filter(country =>
        country.region.toLowerCase().includes(region.toLowerCase())
      );
    }
    set({ filteredCountries: filtered });
  }
});

export const useStore = create(store);
