const axios = require('axios');
// Get your own API Key https://developers.themoviedb.org/3/getting-started/introduction
const key = process.env.KEY_TMDB;

function searchMovie(people, year) {
    return new Promise(async (resolve, reject) => {
        // Base URL
        let url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&language=en-US&sort_by=popularity.desc&include_adult=true`

        // If actors or directors are present, find their ID and update the request URL
        if (people && people.length > 0) {
            // Search for the actors ID in parallel.
            let promises = people.map((person) => {
                console.log(`searching ID for: ${person}`);
                return searchPersonID(person);
            });

            let personsID = await Promise.all(promises);
            console.log(personsID);

            url = url + `&with_people=${personsID.join()}`;
        }

        // If a release year is present, update the request URL
        if (year) {
            url = url + `&year=${year}`;
        }

        try {
            var { data } = await axios.get(url);
        } catch (error) {
            console.log(error);
            reject(error);
        }

        if (data.total_results > 0) {
            console.log(data.results);
            //return data.results.map((movie) => { return movie.title }).join();
            // Choose a random movie from the results
            let random = Math.floor(Math.random() * data.results.length);
            let movie = data.results[random].title;
            resolve(movie);
        } else {
            resolve(null);
        }
    });


}

function findSimilar(movie) {
    console.log(`Finding similar movies to: ${movie}`);
    return new Promise(async (resolve, reject) => {
        try {
            var movieID = await searchMovieID(movie);
        } catch (error) {
            console.log(error);
            reject(error);
        }
        // No MovieID found for the given title. Return early.
        if (!movieID) {
            return null;
        }
        // Try to find similar movies
        let url = `https://api.themoviedb.org/3/movie/${movieID}/similar?api_key=${key}&language=en-US`;

        try {
            var { data } = await axios.get(url);
        } catch (error) {
            console.log(error);
            reject(error);
        }

        if (data.total_results > 0) {
            // return data.results.map((movie) => { return movie.title })
            // Choose a random movie from the results
            let random = Math.floor(Math.random() * data.results.length);
            let similar = data.results[random].title;
            console.log(`${similar} is similar to: ${movie}`);
            resolve(similar)
        } else {
            resolve(null)
        }

    });
}

function searchMovieID(movie) {
    console.log(`Finding movieID for: ${movie}`);
    return new Promise(async (resolve, reject) => {
        let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${movie}&include_adult=${true}`;
        try {
            var { data } = await axios.get(url);
        } catch (error) {
            console.log(error);
            reject(error);
        }

        if (data.total_results > 0) {
            let movieID = data.results[0].id; // Select the most popular movie
            console.log(`The movieID for ${movie} is: ${movieID}`);
            resolve(movieID);
        }
        else { resolve(null) }
    });


}

function searchPersonID(person) {
    console.log(`Finding personID for ${person}`);
    return new Promise(async (resolve, reject) => {
        let url = `https://api.themoviedb.org/3/search/person?api_key=${key}&query=${person}`;

        try {
            var { data } = await axios.get(url);
        } catch (error) {
            console.log(error)
            reject(error)
        }

        if (data.total_results > 0) {
            let personID = data.results[0].id; // Select the most popular result
            console.log(`The personID for ${person} is ${personID}`);
            resolve(personID);
        }
        else { resolve(null); }
    })
}

function seachGenre() { }

module.exports = { searchMovie, findSimilar }