import Plot from 'react-plotly.js'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useState } from 'react'

const GET_MOVIES = gql`
  query GetMovies {
    movies {
      id
      title
      release_year
    }
  }
`

const GET_RATINGS_BY_MOVIE = gql`
  query GetRatings($movieId: ID!) {
    ratings(movie_id: $movieId) {
      id
      score
    }
  }
`

const ADD_RATING = gql`
  mutation addRating($movieId: ID!, $score: Float!) {
    addRating(movie_id: $movieId, score: $score) {
      id
      score
    }
  }
`

export default function MovieVisualization() {
    const { loading, error, data } = useQuery(GET_MOVIES)
    const [selectedMovieId, setSelectedMovieId] = useState(null)
    const [ratingScore, setRatingScore] = useState(1)

    
    const {
        loading: ratingsLoading,
        error: ratingsError,
        data: ratingsData,
        refetch: refetchRatings,
    } = useQuery(GET_RATINGS_BY_MOVIE, {
        variables: { movieId: selectedMovieId },
        skip: !selectedMovieId,
    })

    const [addRating, { loading: mutationLoading }] = useMutation(ADD_RATING)

    if (loading) return <p>Loading movies...</p>
    if (error) return <p>Error loading movies: {error.message}</p>

    const handleMovieSelect = (event) => {
        setSelectedMovieId(event.target.value)
    }

    const handleAddRating = async () => {
        if (ratingScore < 1 || ratingScore > 10) {
            alert('Score must be between 1 and 10.')
            return
        }

        try {
            console.log('trigger adding')
            await addRating({
                variables: {
                    movieId: selectedMovieId,
                    score: parseFloat(ratingScore),
                },
            })
            setRatingScore(1)
            if (selectedMovieId) {
                console.log('trigger refetching')
                await refetchRatings()
            }
        } catch (error) {
            console.error('Failed to add rating:', error)
        }
    }

    const scores = ratingsData?.ratings?.length > 0
        ? ratingsData.ratings.map((r) => Math.round(r.score)) 
        : []

    const totalRatings = scores.length

    const ratingCounts = Array.from({ length: 10 }, (_, i) => {
        const score = i + 1
        const count = scores.filter((s) => s === score).length
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
        return { score, percentage }
    })

    const average = scores.length > 0
        ? scores.reduce((acc, val) => acc + val, 0) / scores.length
        : 0

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎬 Movie Ratings</h2>

            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <select
                    onChange={handleMovieSelect}
                    defaultValue=""
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        width: '60%',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                    }}
                >
                    <option value="" disabled>Select movie</option>
                    {data.movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                            {movie.title} ({movie.release_year})
                        </option>
                    ))}
                </select>
            </div>

            {/* Ratings */}
            {selectedMovieId && (
                <div>
                    {ratingsLoading && <p>Loading ratings...</p>}
                    {ratingsError && <p>Error loading ratings: {ratingsError.message}</p>}

                    {ratingsData && (
                        <>
                            {/* Chart */}
                            <Plot
                                data={[
                                    {
                                        type: 'bar',
                                        orientation: 'h',
                                        x: ratingCounts.map(r => r.percentage),
                                        y: ratingCounts.map(r => r.score),
                                        marker: { color: 'rgba(58, 200, 225, 0.8)' },
                                        text: ratingCounts.map(r => `${r.percentage.toFixed(1)}%`),
                                        textposition: 'auto',
                                    },
                                ]}
                                layout={{
                                    title: 'Ratings Distribution (Percent)',
                                    xaxis: { title: 'Percentage (%)', range: [0, 100] },
                                    yaxis: { title: 'Rating (1-10)', autorange: 'reversed' },
                                    margin: { l: 50, r: 30, t: 50, b: 50 },
                                    height: 500,
                                    plot_bgcolor: '#f9f9f9',
                                    paper_bgcolor: '#f9f9f9',
                                }}
                            />

                            {/* Average */}
                            <p style={{
                                textAlign: 'center',
                                fontSize: '20px',
                                marginTop: '20px',
                                fontWeight: 'bold',
                            }}>
                                ⭐ Average Score: {average.toFixed(2)}
                            </p>
                        </>
                    )}

                    {/* Add Rating */}
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <h3>Add Your Rating:</h3>
                        <input
                            type="number"
                            placeholder="Score (1 - 10)"
                            step="1"
                            min="1"
                            max="10"
                            value={ratingScore}
                            onChange={(e) => setRatingScore(parseInt(e.target.value))}
                            style={{ padding: '10px', fontSize: '16px', width: '100px', marginRight: '10px' }}
                        />
                        <button
                            onClick={handleAddRating}
                            disabled={mutationLoading || !ratingScore}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            {mutationLoading ? 'Adding...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
