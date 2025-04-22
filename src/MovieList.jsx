import { useQuery, gql } from '@apollo/client';

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ul>
            {data.movies.map((movie) => (
                <li key={movie.id}>
                    <strong>{movie.title}</strong> ({movie.release_year}) – {movie.genre}
                    <p>{movie.description}</p>
                </li>
            ))}
        </ul>
    );
}