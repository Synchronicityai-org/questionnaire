import { create } from "zustand";
import { useSearchParams } from "react-router-dom";
const store = (set,get) =>({
    queryParam : '',
    display: 'search for books',
    index: 0,
    pageNumbers: [],
    active : 0,
    totalItems : 0,
    setTotalItems: (value)=>{
        set({totalItems: value})
    },
    setActive:(value)=>{
        set({active: value})
        get().setPageNumbers();
        get().fetchBooks();
    },
    setPageNumbers: async () => {
        const totalPages = Math.ceil(get().totalItems / 40);
        console.log(totalPages)
        const activeIndex = get().active;
        let newIndex = activeIndex > 2 ? activeIndex - 2 : 0;
        await get().setIndex(newIndex);
        const pageNumbers = [];
        for (let i = newIndex; i < newIndex + 5 && i < totalPages; i++) {
            pageNumbers.push(i);
        }
        await set({ pageNumbers });
    },    
    setIndex: (value)=>{
        set({index: value})
    },
    setDisplay: ()=> set({display: 'No Books Found'}),
    setQueryParam : (value)=>{
        set({queryParam : value, active: 0, pageNumbers: []})
    }, 
    books: [],
    setBooks: (data)=> set({books: data}),
    fetchBooks: async ()=>{
        const baseUrl = 'https://www.googleapis.com/books/v1/volumes'
        const url = new URL(baseUrl);
        url.searchParams.set('q', get().queryParam);
        url.searchParams.set('maxResults', 20);
        url.searchParams.set('startIndex',get().index);
        try{
            const response = await fetch(url.toString());
            const data = await response.json();
            if(data){
                get().setBooks(data);
                get().setDisplay();
                get().setTotalItems(data.totalItems)
                get().setPageNumbers();
                console.log('Data fetched succesfully')
            }
            else{
                console.log('Error fetching data')
            }
            }
        catch(error){
            console.error('Error:', error)
        }
    },
})

export  const useStore = create(store)