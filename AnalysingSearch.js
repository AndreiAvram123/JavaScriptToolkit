const searchButton = document.getElementById('searchButton');
const searchField = document.getElementById('searchField');
let queriesData = [];
let startedTime;
let finishedTime = 0;
let fileNameData = "taskData.json";
let searchSuggestionsOn = true
let maxNumberSuggestions = 7;

//add an event listener for where the user clicks on the search button
searchButton.addEventListener('click', () => {
    queriesData[queriesData.length - 1].queryPerformedBy = "Search button"
    performQuery(searchField.value);
});


function saveSearchData() {
    let dataObject = {};
    dataObject.queriesData = queriesData;
    dataObject.averageAreaData = getAverageAreaData()
    exportDataFile(dataObject, fileNameData);
}


var exportDataFile = (function () {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        let json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());


searchField.onkeyup = (event) => checkKey(event);

function startTimer() {
    if (startedTime === undefined) {
        startedTime = new Date().getTime();
        let newQueryData = {};
        newQueryData.suggestionOn = searchSuggestionsOn;
        newQueryData.maxNumberSuggestions = maxNumberSuggestions;
        newQueryData.currentQueryEntered = [];
        newQueryData.currentQueryEntered.push("_start_");
        queriesData.push(newQueryData);

    }
}


function recordSearchByEnter() {
    queriesData[queriesData.length - 1].queryPerformedBy = "Enter pressed"
}

function checkKey(event) {
    function recordKeyData() {
        queriesData[queriesData.length - 1].currentQueryEntered.push(searchField.value);
    }

    if (event.key === 'Enter') {
        recordSearchByEnter();
        performQuery(searchField.value);
    } else {
        recordKeyData();
        fetchSuggestions(searchField.value);
    }

}

function recordSuggestionSelected(suggestion) {
    queriesData[queriesData.length - 1].queryPerformedBy = "Search suggestion selected : " + suggestion;
}

