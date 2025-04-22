import { useState } from 'react';
import MovieList from './MovieList';

export default function MovieExplorer() {
  const [genre, setGenre] = useState('');
  const [minRating, setMinRating] = useState(0);

  console.log('Rendering MovieExplorer');
  return (
    <div>
      <h2>Explore Movies</h2>

      <label>Genre: </label>
      <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g., Drama" />

      <label>Min Rating: </label>
      <input
        type="number"
        value={minRating}
        onChange={(e) => setMinRating(parseFloat(e.target.value))}
        step="0.1"
        min="0"
        max="10"
      />

      <MovieList genre={genre} minRating={minRating} limit={20} />
    </div>
  );
}
