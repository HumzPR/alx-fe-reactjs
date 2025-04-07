import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = "c1d9c062859ee2693fafa991d613045a";
  const apiUrl = "https://api.themoviedb.org/3/movie/popular";
  const searchUrl = "https://api.themoviedb.org/3/search/movie"; 
  const youtubeUrl = "https://www.youtube.com/watch?v="; 

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl, {
          params: {
            api_key: apiKey,
            language: "en-US",
            page: 1,
          },
        });
        if (response.status === 200 && response.data.results) {
          setMovies(response.data.results);
          setErrorMessage(""); 
        } else {
          setErrorMessage("No movies found.");
        }
      } catch (error) {
        console.error("Network error or invalid API response:", error);
        if (!error.response) {
          setErrorMessage("Network error: Please check your connection.");
        } else if (error.response.status >= 500) {
          setErrorMessage("Server error: Please try again later.");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl, {
          params: {
            api_key: apiKey,
            language: "en-US",
            page: 1,
          },
        });
        if (response.status === 200 && response.data.results) {
          setMovies(response.data.results);
          setErrorMessage(""); 
        }
      } catch (error) {
        console.error("Network error or invalid API response:", error);
        if (!error.response) {
          setErrorMessage("Network error: Please check your connection.");
        } else if (error.response.status >= 500) {
          setErrorMessage("Server error: Please try again later.");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(searchUrl, {
        params: {
          api_key: apiKey,
          query: query,
          language: "en-US",
          page: 1,
        },
      });
      if (response.status === 200 && response.data.results) {
        if (response.data.results.length === 0) {
          setErrorMessage("No movies found.");
        } else {
          setMovies(response.data.results);
          setErrorMessage(""); 
        }
      } else {
        setErrorMessage("No movies found.");
      }
    } catch (error) {
      console.error("Network error or invalid API response:", error);
      if (!error.response) {
        setErrorMessage("Network error: Please check your connection.");
      } else if (error.response.status >= 500) {
        setErrorMessage("Server error: Please try again later.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);

    try {
      const response = await axios.get(
        'https://api.themoviedb.org/3/movie/${movie.id}/videos',
        {
          params: {
            api_key: apiKey,
            language: "en-US",
          },
        }
      );
      if (response.status === 200 && response.data.results) {
        const trailer = response.data.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailer) {
          setSelectedMovie((prevState) => ({
            ...prevState,
            trailerUrl: `${youtubeUrl}${trailer.key}`,
          }));
        } else {
          setSelectedMovie((prevState) => ({
            ...prevState,
            trailerUrl: null,
          }));
        }
      } else {
        setSelectedMovie((prevState) => ({
          ...prevState,
          trailerUrl: null,
        }));
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  return (
    <div className="container bg-black text-white mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Movie App</h1>

      <div className="mb-8 text-black flex justify-center">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 border border-gray-300 rounded-lg w-2/3"
        />
      </div>

      {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="grid text-black grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleMovieClick(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-80 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold text-xl">{movie.title}</h2>
              <p className="text-gray-500">{movie.release_date}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-700 text-white p-6 rounded-lg w-2/3 max-h-full overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4">{selectedMovie.title}</h2>
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
              alt={selectedMovie.title}
              className="w-64 h-96 object-cover mb-4"
            />
            <p className="mb-4">{selectedMovie.overview}</p>

            {selectedMovie.trailerUrl && (
              <iframe
                className="w-full h-60 mb-4"
                src={selectedMovie.trailerUrl}
                title="Trailer"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}

            <button
              onClick={() => setSelectedMovie(null)}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full absolute top-2 right-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
