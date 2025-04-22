import Plot from 'react-plotly.js'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useState } from 'react'


const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      title
      genre
    }
  }
`

const GET_RATINGS_BY_MOVIE = gql`
  query GetRatings($movieId: ID!) {
    ratings(movie_id: $movieId) {
      id
      text
      score
    }
  }
`

const ADD_RATING = gql`
  mutation addRating($movieId: ID!, $text: String!, $score: Float!) {
    addRating(movie_id: $movieId, text: $text, score: $score) {
      id
      text
      score
    }
  }
`

export default function MovieVisualization() {
    const { loading, error, data } = useQuery(GET_MOVIES)
    const [selectedMovieId, setSelectedMovieId] = useState(null)
    const [ratingText, setRatingText] = useState('')
    const [ratingScore, setRatingScore] = useState(0)

    const {
        loading: ratingsLoading,
        error: ratingsError,
        data: ratingsData,
        refetch: refetchRatings,
    } = useQuery(GET_RATINGS_BY_MOVIE, {
        variables: { movieId: selectedMovieId },
        skip: !selectedMovieId, // skip query until a movie is selected
    })

    const [addRating, { loading: mutationLoading }] = useMutation(ADD_RATING)

    if (loading) return <p>Loading movies...</p>
    if (error) return <p>Error loading movies: {error.message}</p>

    const handleMovieSelect = (event) => {
        setSelectedMovieId(event.target.value)
    }

    const handleAddRating = async () => {
        await addRating({
            variables: {
                movieId: selectedMovieId,
                text: ratingText,
                score: parseFloat(ratingScore),
            },
        })

        setRatingText('')
        setRatingScore('')
        refetchRatings()
    }

    return (
        <div>
            <h2>Select a Movie to see Ratings</h2>
            <select onChange={handleMovieSelect} defaultValue="">
                <option value="" disabled>Select movie</option>
                {data.movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                        {movie.title} ({movie.genre})
                    </option>
                ))}
            </select>

            {selectedMovieId && (
                <>
                    {ratingsLoading && <p>Loading ratings...</p>}
                    {ratingsError && <p>Error loading ratings: {ratingsError.message}</p>}
                    {ratingsData && ratingsData.ratings.length > 0 ? (
                        <Plot
                            data={[
                                {
                                    type: 'bar',
                                    x: ratingsData.ratings.map((r) => r.text),
                                    y: ratingsData.ratings.map((r) => r.score),
                                    marker: { color: 'teal' },
                                },
                            ]}
                            layout={{
                                title: 'Ratings for Selected Movie',
                                xaxis: { title: 'Rating Comments' },
                                yaxis: { title: 'Score' },
                            }}
                        />
                    ) : (
                        ratingsData && <p>No ratings found for this movie.</p>
                    )}
                    <h3>Add a Rating:</h3>
                    <div>
                        <input
                            type="text"
                            placeholder="Rating comment"
                            value={ratingText}
                            onChange={(e) => setRatingText(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Score (0 - 10)"
                            step="0.1"
                            min="0"
                            max="10"
                            value={ratingScore}
                            onChange={(e) => setRatingScore(e.target.value)}
                        />
                        <button onClick={handleAddRating} disabled={mutationLoading}>
                            {mutationLoading ? 'Adding...' : 'Add Rating'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}