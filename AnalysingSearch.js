
/**
 * Author Andrei Avram
 * @type {HTMLElement}
 */
const searchButton = document.getElementById('searchButton');
const searchField = document.getElementById('searchField');

const search_button_pressed_key = "SEARCH_BUTTON_PRESSED_KEY";
const enter_pressed_key = "ENTER_PRESSED_VALUE";
const queries_entered_key = "QUERIES_ENTERED_KEY";
var searchButtonPressed = 0;
var enterButtonPressed = 0;
var queries = [];

//add an event listener for where the user clicks on the search button
searchButton.addEventListener('click', () => {
    recordSearchByButton();
    performQuery(searchField.value);
});

searchField.addEventListener('keyup', (event) => checkKey(event));


function recordSearchByButton() {
    searchButtonPressed++;
    sessionStorage.setItem(search_button_pressed_key, searchButtonPressed.toString());
    console.log("Search Button pressed " + searchButtonPressed);
}
function recordSearchByEnter() {
    enterButtonPressed++;
    sessionStorage.setItem(enter_pressed_key, enterButtonPressed.toString());
    console.log("Enter pressed " + enterButtonPressed);
}

//check which key the user has pressed
function checkKey(event) {
    if (event.key === 'Enter') {
        recordSearchByEnter();
        performQuery(searchField.value);
    } else {
        recordEnteredQuery();
        fetchSuggestions(searchField.value);
    }

}

function recordEnteredQuery() {
    if (searchField.value.trim() === "") {
        //insert _ into the data to mark the delete of a query
        queries.push("_")
    } else {
        queries.push(searchField.value);
        sessionStorage.setItem(queries_entered_key, JSON.stringify(queries));
    }
    console.log("Queries  " + queries);
}
function recordSuggestionSelected(suggestion){
    queries.push("!!!" + suggestion + "!!!");
    sessionStorage.setItem(queries_entered_key, JSON.stringify(queries));
    console.log("Queries  " + queries);
}

