import { useQuery, gql } from '@apollo/client';
import { useState, useMemo } from 'react';
import './MovieList.css';

const GET_MOVIES = gql`
  query GetMovies($limit: Int!, $offset: Int!, $genre: String) {
    movies(limit: $limit, offset: $offset, genre: $genre) {
      id
      title
      release_year
      genre
      description
    }
  }
`;

const GET_TOTAL_MOVIES = gql`
  query GetTotalMovies($genre: String) {
    totalMovies(genre: $genre)
  }
`;

const MOVIES_PER_PAGE = 10;

export default function MovieList() {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const genreFilter = selectedGenre === 'All' ? null : selectedGenre;

  const { loading, error, data } = useQuery(GET_MOVIES, {
    variables: {
      limit: MOVIES_PER_PAGE,
      offset: (currentPage - 1) * MOVIES_PER_PAGE,
      genre: genreFilter,
    },
  });

  const { data: totalMoviesData } = useQuery(GET_TOTAL_MOVIES, {
    variables: {
      genre: genreFilter,
    },
  });

  const parseGenres = (genreStr) => {
    try {
      const genresArray = JSON.parse(genreStr.replace(/'/g, '"'));
      return genresArray.map((genre) => genre.name).join(', ');
    } catch (e) {
      console.error('Error parsing genres:', e);
      return 'N/A';
    }
  };

  // Memoize genre list
  const allGenres = useMemo(() => {
    if (!data?.movies) return [];
    const genres = data.movies.flatMap((movie) =>
      parseGenres(movie.genre).split(',').map((g) => g.trim())
    );
    return Array.from(new Set(genres));
  }, [data?.movies]);

  const totalMovies = totalMoviesData?.totalMovies || 0;
  const pageCount = Math.ceil(totalMovies / MOVIES_PER_PAGE);

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) =>
      Math.min(Math.max(prevPage + direction, 1), pageCount)
    );
  };

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p>Error loading movies: {error.message}</p>;

  return (
    <>
      <div className="genre-filter">
        <label>Filter by Genre: </label>
        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setCurrentPage(1); // Reset page on filter change
          }}
        >
          <option value="All">All</option>
          {allGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="movie-container">
        {data.movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <h2 className="movie-title">{movie.title}</h2>
            <p className="movie-genre">{parseGenres(movie.genre)}</p>
            <p className="movie-year">{movie.release_year}</p>
            <p className="movie-description">{movie.description}</p>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(-1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} / {pageCount}
        </span>
        <button
          disabled={currentPage === pageCount}
          onClick={() => handlePageChange(1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
