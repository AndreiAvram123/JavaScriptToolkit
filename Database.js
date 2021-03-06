const dataContainers = document.getElementsByClassName("data-container");
//the required prefix in order to get the poster for the movie from the API
const posterURLPrefix = "https://image.tmdb.org/t/p/w500";
const KEY_OPENED_MOVIE = "KEY_OPENED_MOVIE";
let apiKey = "55398af9b60eda4997b848dd5ccf7d44";
let apiURlNowPlaying = "https://api.themoviedb.org/3/movie/now_playing?api_key=" + apiKey + "&page=";
let apiURlPopular = "https://api.themoviedb.org/3/movie/popular?api_key=" + apiKey;
let apiURlTopRated = "https://api.themoviedb.org/3/movie/top_rated?api_key=" + apiKey;
let apiURlSearch = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey;
let currentPage = 0;


$("#loadMoreButton").click(function () {
    fetchMoreMovies();
});

function fetchMoreMovies() {
    currentPage++;
    let url = apiURlNowPlaying + currentPage;
    fetchMoviesFromApi(url);
}

function loadCategory(categoryName, element) {
    removeFetchedMovies();
    $("a.category").css("background-color", "#F1F1F1");

    if (element !== undefined) {
        element.style.background = "#4CAF50";
    }
    switch (categoryName) {
        case "popular":
            fetchMoviesFromApi(apiURlPopular);
            break;
        case "topRated":
            fetchMoviesFromApi(apiURlTopRated);
            break;
        default:
            fetchMoviesFromApi(apiURlNowPlaying + "1");
    }
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

function removeFetchedMovies() {
    currentPage = 0;
    for (let i = 0; i < dataContainers.length; i++) {
        dataContainers[i].innerHTML = "";
    }
}

//get data from the movie api
function fetchMoviesFromApi(url) {
    $.ajax(
        {
            url: url,
            success: function (data) {
                insertFetchedData(data);
                startHeatmap();
            }
        }
    )
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
        description.innerText = movies[i]["overview"].substring(0, 140);
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


function insertFetchedData(data) {
    let movies = [];
    for (let i = 0; i < data.results.length; i++) {
        movies.push(data.results[i]);
        //make a cache of movies
    }
    insertDataInView(movies);
}


/**
 * This function fetches suggestions from the database regarding
 * movie titles
 * @param query
 */
function fetchSuggestions(query) {
    if (searchSuggestionsOn) {
        query.replace(" ", "+");
        if (query.trim() !== "") {
            $.ajax({
                url: apiURlSearch,
                data: {
                    query: query
                },
                success: function (data) {
                    let suggestions = [];
                    for (let i = 0; i < data.results.length && i <= maxNumberSuggestions; i++) {
                        suggestions.push(data.results[i]["title"]);
                    }
                    autocomplete(suggestions);
                }
            });
        } else {
            closeAllLists()
        }
    }
}

function executeAPISearchForMovie(query) {
    query.replace(" ", "+");
    let url = apiURlSearch + "&query=" + query;
    fetch(url).then(response => {
        return response.text();
    }).then(data => {
        insertFetchedData(JSON.parse(data));
    })
}


function exportData() {
    pushAreaDataToServer();
}

function pushAreaDataToServer() {
    console.log("Exporting data... It may take time on a slow connection")
    let formData = new FormData();
    let areaData = getAverageAreaData();
    formData.append("topL", areaData.topLeft);
    formData.append("topC", areaData.topCenter);
    formData.append("topR", areaData.topRight);
    formData.append("bottomL", areaData.bottomLeft);
    formData.append("bottomC", areaData.bottomCenter);
    formData.append("bottomR", areaData.bottomRight);
    formData.append("imageData", heatmap.getCanvasData());
    fetch("Collector.php?requestName=AddAreaData", {
        method: 'POST',
        body: formData,
    }).then(function (response) {
        return response.text();
    }).then(data => {
        console.log("the data has been successfully exported :)")
    });
}


function pushDataToServer(dataObject) {
    let formData = new FormData();
    formData.append("timeRequired", dataObject.timeRequired);
    formData.append("textTyped", dataObject.currentQueryEntered);
    formData.append("suggestionsOn", searchSuggestionsOn + "");
    formData.append("queryPerformedBy", dataObject.queryPerformedBy);
    formData.append("maxNumberSuggestions", dataObject.maxNumberSuggestions);

    fetch("Collector.php?requestName=addData", {
        method: 'POST',
        body: formData,
    }).then(function (response) {
        return response.text();
    }).then(data => {
        console.log(data);
    });
}


/**
 * This function is used in order to perform
 * a movie search by executing an API query
 * @param query
 */

function performQuery(query) {
    function addQueryData() {
        finishedTime = new Date().getTime();
        let currentQueryData = queriesData[queriesData.length - 1];
        currentQueryData.timeRequired = finishedTime - startedTime;
        currentQueryData.currentQueryEntered.push("!!!!" + query + "!!!!!");
        startedTime = undefined;
        pushDataToServer(currentQueryData);
    }

    addQueryData();
    if (query.trim() !== "") {
        searchField.value = "";
        let loadMoreButton = document.getElementById("loadMoreButton");
        if (loadMoreButton) {
            loadMoreButton.style.visibility = 'hidden';
        }
        closeAllLists();
        removeAllDisplayedMovies();
        executeAPISearchForMovie(query);
    }
}

function removeAllDisplayedMovies() {
    for (let i = 0; i < dataContainers.length; i++) {
        dataContainers[i].innerHTML = "";
    }

}