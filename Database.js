const dataContainers = document.getElementsByClassName("col");
var cachedMovies = [];
//the required prefix in order to get the poster for the movie from the API
var posterURLPrefix = "https://image.tmdb.org/t/p/w500";
const KEY_OPENED_MOVIE = "KEY_OPENED_MOVIE";

let currentPage = 0;
//attach an listener to the load more button
function addListenerToLoadMore() {
    let loadMoreButton = document.getElementById("loadMoreButton");
    loadMoreButton.addEventListener('click', fetchMoviesFromApi);
}

function autocomplete(suggestions) {
    let currentFocus;
    /*execute a function when someone writes in the text field:*/
    let container, suggestedItem, i, val = searchField.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
        return false;
    }
    currentFocus = -1;
    container = document.createElement("div");
    container.setAttribute("id", this.id + "autocomplete-list");
    container.setAttribute("class", "autocomplete-items");
    //insert the suggestions container as a child in the search field
    searchField.parentNode.appendChild(container);
    //insert all available suggestions
    for (i = 0; i < suggestions.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (suggestions[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            suggestedItem = document.createElement("DIV");
            //make the matching letters bold
            suggestedItem.innerHTML = "<strong>" + suggestions[i].substr(0, val.length) + "</strong>";
            suggestedItem.innerHTML += suggestions[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            suggestedItem.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            suggestedItem.addEventListener("click", function (e) {
                /*insert the value for the autocomplete text field:*/
                recordSuggestionSelected(this.getElementsByTagName("input")[0].value);
                performQuery(this.getElementsByTagName("input")[0].value);
                closeAllLists();
            });
            container.appendChild(suggestedItem);
        }
    }



    //close the list if the user presses somewhere else on the screen
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

}
//call this method in order to hide all auto - suggestions
function closeAllLists(elmnt) {
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
        if (elmnt !== x[i] && elmnt !== searchField) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

//get data from the movie api
function fetchMoviesFromApi() {
    currentPage++;
    let apiURI = "https://api.themoviedb.org/3/movie/now_playing?api_key=55398af9b60eda4997b848dd5ccf7d44&page=" + currentPage;
    fetch(apiURI)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            insertFetchedData(data);
            startHeatmap();
        })
}

/**
 * This function is used in order to insert the data fetched from the API
 * into the view
 * @param movies
 */
function insertDataInView(movies) {
    for (let i = 0; i < movies.length; i++) {
        //depending on the layout of the page, we may want to display multiple columns of movies
        let container = dataContainers[i % dataContainers.length];
        let card = document.createElement("div");
        card.className = "card";

        let title = document.createElement("h4");
        title.className = "text-center";
        title.innerText = movies[i]["title"];
        card.append(title);

        let image = document.createElement("img");
        image.src = posterURLPrefix + movies[i]["poster_path"];
        image.alt = "movie-poster";
        image.className = "movie-poster";
        card.append(image);

        let description = document.createElement("p");
        description.className = "movie-description";
        //make sure that the substring contains full words
        description.innerText = refactorString(movies[i]["overview"].substring(0, 140));
        card.append(description);

        let button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-primary";
        button.innerText = "Read more";
        button.addEventListener('click', () => extendMovie(movies[i]));
        card.append(button);

        container.appendChild(card);

    }
}

/**
 * This function is used in order to open a new page with the
 * full details of a specific movie
 * @param movie
 */
function extendMovie(movie) {
    sessionStorage.setItem(KEY_OPENED_MOVIE, JSON.stringify(movie));
    document.location.href = "ExtendedMovie.html";
}

/**
 * This function is used in order to insert all the data
 * from the opened movie into the view
 */
function insertExtendedMovieIntoView() {

    let extendedMovie = JSON.parse(sessionStorage.getItem(KEY_OPENED_MOVIE));
    let title = document.getElementById("movie-title-extended");
    title.innerText = extendedMovie["title"];

    let description = document.getElementById("movie-description-extended");
    description.innerText = extendedMovie["overview"];

    let poster = document.getElementById("movie-poster-extended");
    poster.src = posterURLPrefix + extendedMovie["poster_path"]

}


function refactorString(stringToCut) {
    while (stringToCut[stringToCut.length - 1] !== ' ') {
        stringToCut = stringToCut.substring(0, stringToCut.length - 1);
    }
    stringToCut += "...";
    return stringToCut;
}

function insertFetchedData(data) {
    let movies = [];
    for (let i = 0; i < data.results.length; i++) {
        movies.push(data.results[i]);
        //make a cache of movies
        cachedMovies.push(data.results[i]);
    }
    insertDataInView(movies);
}

function displayCachedMovies() {
    removeAllDisplayedMovies();
    insertDataInView(cachedMovies);
}

/**
 * This function fetches suggestions from the database regarding
 * movie titles
 * @param query
 */
function fetchSuggestions(query) {
    if(query.trim() !== "") {
        let searchURL = "https://api.themoviedb.org/3/search/movie?api_key=55398af9b60eda4997b848dd5ccf7d44&query=" + query;
        searchURL.replace(" ", "+");
        let suggestions = [];
        fetch(searchURL)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
                for (let i = 0; i < data.results.length; i++) {
                    suggestions.push(data.results[i]["title"]);
                }
                autocomplete(suggestions);
            });
    }
}

function executeAPISearch(query) {
    let searchURL = "https://api.themoviedb.org/3/search/movie?api_key=55398af9b60eda4997b848dd5ccf7d44&query=" + query;
    searchURL.replace(" ", "+");
    fetch(searchURL)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
            insertFetchedData(data);
        });
}

/**
 * This function is used in order to perform
 * a movie search by executing an API query
 * @param query
 */
function performQuery(query) {
    if (query.trim() !== "") {
        searchField.value = "";
        let loadMoreButton = document.getElementById("loadMoreButton");
        if(loadMoreButton) {
            loadMoreButton.style.visibility = 'hidden';
        }
        closeAllLists();
        removeAllDisplayedMovies();
        executeAPISearch(query);
    } else {
        displayCachedMovies();
    }
}

function removeAllDisplayedMovies() {
    for (let i = 0; i < dataContainers.length ; i++) {
        while (dataContainers[i].firstChild) {
            dataContainers[i].removeChild(dataContainers[i].firstChild);
        }
    }

}