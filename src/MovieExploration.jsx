import MovieList from './MovieList';

export default function MovieExplorer() {

  console.log('Rendering MovieExplorer');
  return (
    <div>
      <h2>Explore Movies</h2>
      <MovieList limit={20} />
    </div>
  );
}
