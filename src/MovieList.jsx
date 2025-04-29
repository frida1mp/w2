import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';
import './MovieList.css';  // Create this CSS file to style the cards.

const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      title
      release_year
      genre
      description
    }
  }
`;

export default function MovieList() {
  const { loading, error, data } = useQuery(GET_MOVIES);
  const [selectedGenre, setSelectedGenre] = useState('All')


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const parseGenres = (genreStr) => {
    try {
      const genresArray = JSON.parse(
        genreStr.replace(/'/g, '"') 
      );
      return genresArray.map((genre) => genre.name).join(', ');
    } catch (e) {
      console.error('Error parsing genres:', e);
      return 'N/A';
    }
  };

  const allGenres = Array.from(
    new Set(
      data.movies.flatMap(movie => {
        const genresArray = parseGenres(movie.genre).split(',').map(g => g.trim())
        return genresArray
      })
    )
  )

  console.log(data.movies);
  return (
    <>
      <div className="genre-filter">
        <label>Filter by Genre: </label>
        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="All">All</option>
          {allGenres.map(genre => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="movie-container">
        {data.movies.filter(movie => {
          if (selectedGenre === 'All') return true
          const genresArray = parseGenres(movie.genre).split(',').map(g => g.trim())
          return genresArray.includes(selectedGenre)
        })
          .map(movie => (
            <div className="movie-card" key={movie.id}>
              <h2 className='movie-title'>{movie.title}</h2>

              <p className="movie-genre">{parseGenres(movie.genre)}</p>
              <p className="movie-year">{movie.release_year}</p>
              <p className="movie-description">{movie.description}</p>
            </div>
          ))}
      </div>
    </>
  );
}
