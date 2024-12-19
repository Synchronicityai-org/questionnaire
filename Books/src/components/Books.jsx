import React from 'react'
import {useStore} from './store'
import { useEffect} from 'react'

function Books() {
    const {fetchBooks,queryParam,books,display,setPageNumbers,pageNumbers,active,setActive} = useStore();
    useEffect(() => {
        if (queryParam) {
            fetchBooks();
            setPageNumbers();
        }
    }, [queryParam, fetchBooks, setPageNumbers]);
    
    return (
        <div className="min-h-screen mt-4">
          <div className="grid grid-cols-5 gap-4">
            {books.totalItems > 0 ? (
              books.items.map((book) => {
                return (
                  <div key={book.id} className="p-4 border-8 rounded place-items-center border-woodColor">
                    <h2 className="font-bold text-lg">{book.volumeInfo.title}</h2>
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <img
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt={book.volumeInfo.title}
                        className="w-fit h-fit"
                      />
                    ) : (
                      <p>No Image Available</p>
                    )}
                    <ul className="mt-2">
                      {book.volumeInfo.authors?.map((author, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {author}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <p className="col-span-4 text-center">{display}</p>
            )}
          </div>
          <ul className='flex flex-wrap my-5 justify-self-center gap-2'>
           {pageNumbers.map(pageNumber =>(
            <li key={pageNumber} className={`${active === pageNumber ? 'bg-black text-white' : ''} p-2 border-2 cursor-pointer`} onClick={()=> setActive(pageNumber)} >{pageNumber+1}</li>
           ))}
          </ul>
        </div>
      );
      
}

export default Books
