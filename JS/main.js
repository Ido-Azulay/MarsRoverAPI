"use strict";

const run = (function() {

//my NASA API key:
const API_KEY = "d5QSB4bb34oH4dR9JaFYdM3IOQu8SAwpd02g8TvA"
// const API_KEY = "8JEfNbgGezk4i7S2DDcghZZ5pEm1QPa2yO2k9qyi"

// --------   Date structures  -------
//Dictionary to hold for each rover the available cameras:
const roverData = {};
//List to hold short camera names to fetch with
const roverCameraName = {};
let earthDates = {};
let solDates = {};
let imgUrls = [];
let favoriteImgs = [];
let favoriteImgsInfo = [];



//===============================================================================================
/**
 * Function to hide the div .container of 'Saved Images container' when 'HOME' button pressed.
 * using innerHTML to add and remove d-none from the two containers.
 */
const go2home = () => {
document.getElementById('c1').classList.remove('d-none')
document.getElementById('c3').classList.remove('d-none')
document.getElementById('c2').classList.add('d-none')
}
document.getElementById('home').addEventListener('click', go2home);
//===============================================================================================

/**
 * Same as above, function to hide the div .container of 'Home container' when 'SAVED IMAGES' button pressed.
 * using innerHTML to add and remove d-none from the two containers.
 */
const go2saved = () => {
    document.getElementById('c1').classList.add('d-none')
    document.getElementById('c3').classList.add('d-none')
    document.getElementById('c2').classList.remove('d-none')

    updateFavoriteList();
}
document.getElementById('saved').addEventListener('click', go2saved);
//===============================================================================================

/**
 * Function to show the user the relevant date picker.
 * both date pickers (sol and earth) are held in a .container, we add d-none to irrelevant date picker
 * and remove d-none from relevant date picker.
 */
const updateDateOption = () => {
    const yearType = document.getElementById("yearType");
    const earthDateContainer = document.getElementById("earthDateContainer");
    const solYearContainer = document.getElementById("solYearContainer");

    if (yearType.value === "earth") {
        earthDateContainer.classList.remove("d-none");
        solYearContainer.classList.add("d-none");
    } else if (yearType.value === "sol") {
        earthDateContainer.classList.add("d-none");
        solYearContainer.classList.remove("d-none");
    }
}
//===============================================================================================

//===============================================================================================

/**
 * Function to extract rover names and store them in roverData (been called from fetchRoversAndCameras func)
 * extract for each rover the start and end date to validate user date selection - (store the start and end
 * date in the dictionaries = 1. earthDates, 2. solDates).
 * @param data (JSON data)
 */

function extractRoversAndCameras(data) {
    data.rovers.forEach(rover => {
        const roverName = rover.name;
        roverData[roverName] = rover.cameras.map(camera => camera.full_name);
        roverCameraName[roverName]=rover.cameras.map(camera => camera.name)
    });

    data.rovers.forEach(rover => {
        const roverName = rover.name;
        const landingDate = rover.landing_date;
        const maxDate = rover.max_date;
        const maxSol = rover.max_sol;

        // Update earthDates and solDates
        if (!earthDates[roverName]) {
            earthDates[roverName] = { min: landingDate, max: maxDate };
        } else {
            earthDates[roverName].min = new Date(landingDate) < new Date(earthDates[roverName].min) ? landingDate : earthDates[roverName].min;
            earthDates[roverName].max = new Date(maxDate) > new Date(earthDates[roverName].max) ? maxDate : earthDates[roverName].max;
        }

        if (!solDates[roverName]) {
            solDates[roverName] = { min: 0, max: maxSol };
        } else {
            solDates[roverName].min = Math.min(0, solDates[roverName].min);
            solDates[roverName].max = Math.max(maxSol, solDates[roverName].max);
        }
    });

}

//===============================================================================================

/**
 * Function to fetch rover data and updates the rover dropdown
 */
function fetchRoversAndCameras() {
    fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {

            extractRoversAndCameras(data);
            updateRoverDropdown(); // Call the function to update the dropdown

        })
        .catch(error => console.error("Error fetching rovers:", error));
}
//===============================================================================================

/**
 * Clears existing options, adds a default option,
 * and populates the rover dropdown with rover names from roverData
 */
function updateRoverDropdown() {
    // Clear existing options
    const roverDropdown = document.getElementById('rover');
    roverDropdown.innerHTML = "";

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Select Rover";
    roverDropdown.appendChild(defaultOption);

    // Add options for each rover in roverData
    for (const roverName in roverData) {
        if (roverData.hasOwnProperty(roverName)) {
            const roverOption = document.createElement('option');
            roverOption.value = roverName;
            roverOption.textContent = roverName;
            roverDropdown.appendChild(roverOption);
        }
    }
}
//Call fetch of rovers and cameras function
fetchRoversAndCameras();
//===============================================================================================

/**
 * // Clears existing options, adds a default option,
 * and populates the camera dropdown based on the selected rover
 */
function updateCamerasDropdown() {
    const cameraDropdown = document.getElementById('camera');

    const selectedRover = document.getElementById('rover').value;

    // Clear existing options
    cameraDropdown.innerHTML = "";

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Choose your wanted camera";
    cameraDropdown.appendChild(defaultOption);

    // Add options for cameras based on the selected rover
    const cameras = roverData[selectedRover];
    if (cameras) {
        cameras.forEach(cameraName => {
            const cameraOption = document.createElement('option');
            cameraOption.value = cameraName;
            cameraOption.textContent = cameraName;
            cameraDropdown.appendChild(cameraOption);
        });
    }
}
// Event listener to trigger the update function when the rover changes
const roverDropdown = document.getElementById('rover');
roverDropdown.addEventListener('change', updateCamerasDropdown);

//===============================================================================================

/**
 *  Function to clear selected values in the dropdowns and date inputs
 */
function clearDropdownsAndDates() {
    // Reset the dropdowns to their default state
    roverDropdown.selectedIndex = 0;  // Select the first option
    document.getElementById('camera').selectedIndex = 0;
    //camera.selectedIndex = 0; // Select the first option

    // Clear the date input values
    document.getElementById('earthDate').value = "";  // Clear Earth date
    document.getElementById('solYear').value = "";      // Clear Sol date

    // Reset the year type dropdown to its default state
    document.getElementById('yearType').selectedIndex = 0;

    document.getElementById("roverError").innerHTML = "";
    document.getElementById("cameraError").innerHTML = "";
    document.getElementById("yearTypeError").innerHTML = "";

}

// An event listener to the "Clear" button
    const clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', clearDropdownsAndDates);
//===============================================================================================
// Get the input element and rover dropdown

// Function to set date range based on selected rover
/**
 * Function that accept the selected rover name and set min and max for earth date
 *
 * @param selectedRover -> the selected rover
 */
function setMinMaxDate(selectedRover) {
    const earthInput = document.getElementById('earthDate');

    earthInput.setAttribute('min', earthDates[selectedRover].min);
    earthInput.setAttribute('max', earthDates[selectedRover].max);

}


/**
 * Event listener to dynamically update date range when the rover is changed
 */
roverDropdown.addEventListener('change', function () {
    const selectedRover = roverDropdown.value;
    setMinMaxDate(selectedRover);
});

/**
 * Function to hold the solYear input element and set min and max
 * @type {HTMLElement}
 */

const solInput = document.getElementById('solYear');
solInput.addEventListener('input', function () {
    const selectedRover = roverDropdown.value;

    // Check if solDates for the selected rover is defined
    if (solDates[selectedRover]) {
        const maxSol = solDates[selectedRover].max;

        // Convert input value to a number
        let enteredValue = parseInt(this.value, 10);

        // Check against maxSol and set to the maximum allowed Sol if needed
        if (enteredValue > maxSol) {
            enteredValue = maxSol;
            document.getElementById('solDateError').innerHTML =
                `<span class="text-secondary">Max sol year = ${maxSol}</span>`;
        }

        // Check against a minimum value of 1 and set to 1 if needed
        if (enteredValue < 1) {
            enteredValue = 1;
            document.getElementById('solDateError').innerHTML =
                `<span class="text-secondary">Min sol year = 1</span>`;
        }

        // Set the value back to the validated enteredValue
        this.value = enteredValue;
    }
});


/**
 * Function to check validation for all inputs, return true if valid.
 * @returns {boolean}
 */
const validateData = () => {
    const roverInput = document.getElementById('rover').value;
    const roverError = document.getElementById('roverError');

    const cameraInput = document.getElementById('camera').value;
    const cameraError = document.getElementById('cameraError');

    const yearTypeInput = document.getElementById('yearType').value;
    const yearTypeError = document.getElementById('yearTypeError');

    const earthDateContainer = document.getElementById('earthDateContainer');
    const solYearContainer = document.getElementById('solYearContainer');

    const earthYear = document.getElementById('earthDate').value;
    const earthYearError = document.getElementById('EarthDateError');
    const solYear = document.getElementById('solYear').value;
    const solYearError = document.getElementById('solDateError');




    let validRover = false;
    let validCamera = false;
    let validYearType = false;

    roverError.innerHTML = '';
    cameraError.innerHTML = '';
    yearTypeError.innerHTML = '';
    earthYearError.innerHTML = '';
    solYearError.innerHTML = '';


    if (roverInput === '' || roverInput === 'Select Rover') {
        roverError.innerHTML = '<span class="text-danger">You must choose a rover</span>';
    } else {
        validRover = true;
    }

    if (cameraInput === '' || cameraInput === 'Choose your wanted camera') {
        cameraError.innerHTML = '<span class="text-danger">You must choose a camera</span>';
    } else {
        validCamera = true;
    }

    if (yearTypeInput === '' || yearTypeInput === 'Choose type of year') {
        yearTypeError.innerHTML = '<span class="text-danger">You must choose the type of year</span>';
    } else {
        validYearType = true;
    }

    // Show/hide date inputs based on selected year type
    if (validRover && validCamera && validYearType) {
        if (yearTypeInput === 'earth') {
            if (earthYear !== "") {
                earthDateContainer.classList.remove('d-none');
                solYearContainer.classList.add('d-none');
                return true;
            }
            else {
                earthYearError.innerHTML = '<span class="text-danger">You must enter a date</span>';
            }

        }
        else if (yearTypeInput === 'sol') {
            if (solYear !== "") {
                earthDateContainer.classList.add('d-none');
                solYearContainer.classList.remove('d-none');
                return true;
            }
            else {
                solYearError.innerHTML = '<span class="text-danger">You must enter a date</span>';
            }

        }

        return false; // Data is valid
    }
};

/**
 * Function to be triggered when user press Submit button, call function to run validations,
 * if valid the function will gather the info from form and fetch. The function also add
 * and remove d-none from the spinner div while fetching. The function call a sub function
 * to display the data that came back from the server.
 */
function submitAndFetch() {
    if (!validateData()) {
        return;
    }
    let spin = document.getElementById('loadingSpinner');

    const selectedRover = document.getElementById('rover').value;
    const selectedYearType = document.getElementById('yearType').value;
    let selectedYear;
    let selectedCamera = document.getElementById('camera').value;

    selectedCamera = extractCameraNameFromFullCameraName(selectedRover, selectedCamera);

    if (selectedYearType === "earth") {
        spin.classList.remove('d-none');
        selectedYear = document.getElementById('earthDate').value;
        fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?api_key=${API_KEY}&earth_date=${selectedYear}&camera=${selectedCamera}`)
            .then(response => response.json())
            .then(data => {
                const photos = data.photos;

                imgUrls = [];

                photos.forEach(photo => {
                    const imgUrl = photo.img_src;
                    imgUrls.push(imgUrl);
                });
                displayImg(selectedYearType, selectedYear, selectedCamera, selectedRover); // Call displayImg after fetch completes

                imgUrls.forEach(i => console.log(i));
            })
            .catch(error => {
                console.error("Error fetching photos:", error);
                displayImg(selectedYearType, selectedYear, selectedCamera, selectedRover); // Call displayImg in case of an error
            });
    }

    else if (selectedYearType === "sol") {
        spin.classList.remove('d-none');
        selectedYear = document.getElementById('solYear').value;
        fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${selectedYear}&camera=${selectedCamera}&api_key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const photos = data.photos;

                imgUrls = [];

                photos.forEach(photo => {
                    const imgUrl = photo.img_src;
                    imgUrls.push(imgUrl);
                });

                displayImg(selectedYearType, selectedYear, selectedCamera, selectedRover); // Call displayImg after fetch completes

                imgUrls.forEach(i => console.log(i));
                //console.log(imgUrls.length);
            })
            .catch(error => {
                console.error("Error fetching photos:", error);
                displayImg(selectedYearType, selectedYear, selectedCamera, selectedRover); // Call displayImg in case of an error
            });
    }
    spin.classList.add('d-none');
}

    /**
     * Event listener to trigger the Submit button and call submitAndFetch function.
     * @type {HTMLElement}
     */
    const submitButton = document.getElementById('submitButton');
submitButton.addEventListener('click', submitAndFetch);

    /**
     * Function get the camera name based on the full name for fetching
     * @param selectedRover hold data for the selected rover (full cameras name)
     * @param selectedCamera hold the short name of each camera to fetch with
     * @returns {*} the short camera name based on the full camera name
     */
    const extractCameraNameFromFullCameraName = (selectedRover, selectedCamera) => {
    const d1 = roverData[selectedRover];
    const d2 = roverCameraName[selectedRover];
    if (d1 && d2) {
        const index = d1.indexOf(selectedCamera);
        return d2[index];
    }
}


    /**
     * Function to iterate over the images url (from the fetch) and display them using Bootstrap cards.
     *
     * @param yearType a string holding the selected type of year
     * @param selectedYear a string holds the selected date
     * @param selectedCamera a string holds the camera name
     * @param selectedRover a string holding the selected rover
     */
    const displayImg = (yearType, selectedYear, selectedCamera, selectedRover) => {
    const container = document.getElementById('imgGallery');
    container.innerHTML = '';

    console.log("length: ", imgUrls.length);
    if (imgUrls.length === 0) {
        document.getElementById('noImagesDiv').classList.remove('d-none');
    }

    if (imgUrls.length !== 0) {
        document.getElementById('noImagesDiv').classList.add('d-none');
        let year = '';

        for(let i = 0; i < imgUrls.length; i+= 3){
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row');

            for(let j = i; j < i+3 && j < imgUrls.length; j++){
                // Create a Bootstrap card
                const card = document.createElement('div');
                card.classList.add('card', 'col-4', 'border', 'border-4');

                // Create an image element
                const img = document.createElement('img');
                img.classList.add('card-img-top', 'img-fluid');
                img.src = imgUrls[j];
                card.appendChild(img);

                // Create a card body
                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                // Add text to the card body
                if(yearType === "earth") {
                    year = "Earth date:";
                } else if(yearType === "sol") {
                    year = "Sol date:";
                }

                const p = document.createElement('p');
                p.classList.add('card-text');
                p.innerHTML = `${year} = ${selectedYear} <br> Camera = ${selectedCamera} <br> Mission = ${selectedRover} <br>`;
                cardBody.appendChild(p);

                // Create a card footer for buttons
                const cardFooter = document.createElement('div');
                cardFooter.classList.add('card-footer');

                // Create a Save button
                const saveButton = document.createElement('button');
                saveButton.type = 'button';
                saveButton.classList.add('btn', 'btn-primary', 'border', 'mr-2');
                saveButton.textContent = 'Save';

                // Click event listener to the Save button
                saveButton.addEventListener('click', () => {
                    const imageUrl = imgUrls[j];

                    // Check if the image is already saved
                    if (favoriteImgs.includes(imageUrl)) {
                        alert("This image is already saved in your favorites. You cannot save it again.");
                        return;
                    }

                    // Add the img URL to the favoriteImgs list
                    favoriteImgs.push(imageUrl);
                    //updateImageInfo(j, yearType, selectedYear, selectedRover, selectedCamera);
                    saveButton.style.backgroundColor = 'black';
                    favoriteImgsInfo.push(`${yearType} date: ${selectedYear}, rover: ${selectedRover} camera: ${selectedCamera}`);
                    updateFavoriteList();

                    console.log("favorite size: ", favoriteImgsInfo.length);
                });

                // Create a Watch button
                const watchButton = document.createElement('button');
                watchButton.type = 'button';
                watchButton.classList.add('btn', 'btn-secondary', 'border');
                watchButton.textContent = 'Watch';

                // Click event listener to the Watch button
                watchButton.addEventListener('click', () => {
                    // Open a new tab with the full-sized image
                    window.open(imgUrls[j], '_blank');
                });

                // Append buttons to the card footer
                cardFooter.appendChild(saveButton);
                cardFooter.appendChild(watchButton);

                // Append card body and footer to the card
                card.appendChild(cardBody);
                card.appendChild(cardFooter);

                // Append the card to the row
                rowDiv.appendChild(card);
            }
            container.appendChild(rowDiv);
        }
    }
    console.log(favoriteImgs);
}
    /**
     * Function to build and maintain the favorite img list and present it (in container #c2)
     */
    const updateFavoriteList = () => {
    const favoriteListContainer = document.getElementById('favoriteImagesList');
    favoriteListContainer.innerHTML = ''; // Clear existing list

    favoriteImgs.forEach((imageUrl, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        const imgLink = document.createElement('a');
        imgLink.href = imageUrl;
        imgLink.target = '_blank';
        imgLink.textContent = `Image: ${index + 1}`;

        const imgInfo = favoriteImgsInfo[index];

        const infoParagraph = document.createElement('p');
        infoParagraph.classList.add('card-text');
        infoParagraph.textContent = imgInfo; // Display the stored information

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteButton.textContent = 'X';

        // Add click event listener to delete the image from the list
        deleteButton.addEventListener('click', () => {
            // Remove the image URL and info from the favoriteImgs and favoriteImgsInfo arrays
            favoriteImgs.splice(index, 1);
            favoriteImgsInfo.splice(index, 1);
            // Update the favorite list and carousel
            updateFavoriteList();
        });

        listItem.appendChild(imgLink);
        listItem.appendChild(infoParagraph); // Append the info paragraph
        listItem.appendChild(deleteButton);
        favoriteListContainer.appendChild(listItem);
    });

    updateCarousel();
};

    /**
     * Function to update the carousel based on the favorite images list.
     */
    const updateCarousel = () => {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselExampleCaptions = document.getElementById('carouselExampleCaptions');
    const carouselIndicators = document.querySelector('.carousel-indicators');

    // Check if carouselExampleCaptions is present
    if (!carouselExampleCaptions || !carouselIndicators) {
        console.error("Carousel element or indicators not found.");
        return;
    }

    // Dispose of the existing carousel instance
    const existingCarouselInstance = bootstrap.Carousel.getInstance(carouselExampleCaptions);
    if (existingCarouselInstance) {
        existingCarouselInstance.dispose();
    }

    // Clear existing carousel items and indicators
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';

    // Check if there are favorite images
    if (favoriteImgs.length > 0) {
        favoriteImgs.forEach((imageUrl, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');

            const img = document.createElement('img');
            img.src = imageUrl;
            img.classList.add('d-block', 'w-100');
            carouselItem.appendChild(img);

            const imgInfo = document.createElement('div');
            imgInfo.classList.add('carousel-caption', 'd-none', 'd-md-block');
            imgInfo.innerHTML = `<h5>Image ${index + 1}</h5><p>${favoriteImgsInfo[index]}</p>`;

            // Add button to watch image in full screen
            const watchButton = document.createElement('button');
            watchButton.type = 'button';
            watchButton.classList.add('btn', 'btn-primary', 'border');
            watchButton.textContent = 'Watch';

            // Click event listener to the Watch button
            watchButton.addEventListener('click', () => {
                // Open a new tab with the full-sized image
                window.open(imageUrl, '_blank');
            });

            // Append the watch button under the image info
            imgInfo.appendChild(watchButton);

            carouselItem.appendChild(imgInfo);

            carouselInner.appendChild(carouselItem);

            // Create and append indicator button
            const indicatorButton = document.createElement('button');
            indicatorButton.type = 'button';
            indicatorButton.setAttribute('data-bs-target', '#carouselExampleCaptions');
            indicatorButton.setAttribute('data-bs-slide-to', index.toString());
            if (index === 0) {
                indicatorButton.classList.add('active');
            }
            carouselIndicators.appendChild(indicatorButton);

            // Activate the first item in the carousel
            if (index === 0) {
                carouselItem.classList.add('active');
            }
        });

        // Initialize the Bootstrap carousel manually
        new bootstrap.Carousel(carouselExampleCaptions, {
            interval: false, // Disable automatic sliding
        });
    }
};

    /**
     * Function to remove display-none from carousel container
     */
    const showCarousel = () => {
    document.getElementById('carouselRow').classList.remove('d-none')
}
document.getElementById('startCarousel').addEventListener('click', showCarousel);

    /**
     * Function to remove display-none from carousel container
     */
const hideCarousel = () => {
    document.getElementById('carouselRow').classList.add('d-none')
}
document.getElementById('stopCarousel').addEventListener('click', hideCarousel);



    return {updateDateOption}
})()

