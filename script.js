const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

const cohortName = '2306-FTB-MT-WEB-PT';
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

const fetchAllPlayers = async () => {
    try {
        const response = await fetch(APIURL + 'players');
        if (!response.ok) {
            throw new Error('Failed to fetch players');
        }
        const responseData = await response.json();
        
        if (!responseData.success || !responseData.data || !Array.isArray(responseData.data.players)) {
            throw new Error('Data retrieved is not in the expected format');
        }
        
        const { players } = responseData.data;
        
        return players;
    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
        return [];
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL + `players/${playerId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch player #${playerId}`);
        }
        const playerData = await response.json();
        const playerDetails = playerData?.data?.player; // Accessing the nested player object
        console.log(playerDetails); // Log the playerDetails object
        renderPlayerDetails(playerId, playerDetails);
    } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const renderPlayerDetails = (playerId, playerDetails) => {
    const playerCard = document.getElementById(`player-${playerId}`);
    const existingDetails = playerCard.querySelector('.player-details');
    const detailsButton = playerCard.querySelector('.details-button');

    if (existingDetails) {
        // If details exist, remove them and change button text to "See details"
        existingDetails.remove();
        detailsButton.textContent = 'See Details';
    } else {
        // If details don't exist, render them and change button text to "Hide details"
        const detailsHTML = `
            <div class="player-details">
                <h3>Player Details</h3>
                <p>Name: ${playerDetails.name}</p>
                <p>Breed: ${playerDetails.breed}</p>
                <p>Status: ${playerDetails.status}</p>
                <!-- Add other details as needed -->
            </div>
        `;
        playerCard.insertAdjacentHTML('beforeend', detailsHTML);
        detailsButton.textContent = 'Hide Details';
    }
};


const removePlayer = async (playerId) => {
    try {
        const response = await fetch(APIURL + `players/${playerId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to remove player #${playerId}`);
        }
        const updatedPlayers = await fetchAllPlayers();
        renderAllPlayers(updatedPlayers);
    } catch (err) {
        console.error(`Whoops, trouble removing player #${playerId} from the roster!`, err);
    }
};

const renderAllPlayers = async () => {
    try {
        const players = await fetchAllPlayers();
        if (!Array.isArray(players)) {
            throw new Error('Player list is not an array');
        }

        let playerContainerHTML = '';
        players.forEach(player => {
            playerContainerHTML += `
                <div class="player-card" id="player-${player.id}">
                    <img src="${player.imageUrl}" alt="${player.name}" class="player-image">
                    <h2>${player.name}</h2>
                    <button class="details-button custom-button" data-player-id="${player.id}">See Details</button>
                    <button class="remove-button custom-button" onclick="removePlayer(${player.id})">Remove From Roster</button>
                </div>
            `;
        });
        playerContainer.innerHTML = playerContainerHTML;

        playerContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('details-button')) {
                const playerId = event.target.dataset.playerId;
                await fetchSinglePlayer(playerId);
            }
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering players!', err);
    }
};

const renderNewPlayerForm = () => {
    try {
        const formHTML = `
        <h1 style="text-align: center;">Add a New Player</h1>
        <form id="new-player-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" class="form-input" required><br><br>
        <label for="breed">Breed:</label>
        <input type="text" id="breed" name="breed" class="form-input" required><br><br>
        <label for="status">Status:</label>
        <select id="status" name="status" class="form-input">
            <option value="field">Field</option>
            <option value="bench">Bench</option>
        </select><br><br>
        <label for="imageUrl">Image URL:</label>
        <input type="text" id="imageUrl" name="imageUrl" class="form-input" required><br><br>
        <button type="submit" class="form-submit">ADD PLAYER</button>
    </form>
        `;
        
        newPlayerFormContainer.innerHTML = formHTML;

        const formElement = document.getElementById('new-player-form');
        console.log(formElement); // Check if it's correctly referencing the form element
        formElement.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(formElement);
            const playerData = {};
            formData.forEach((value, key) => {
                playerData[key] = value;
            });

            try {
                await addNewPlayer(playerData);
                const players = await fetchAllPlayers();
                renderAllPlayers(players);
            } catch (error) {
                console.error('Error adding player:', error);
            }
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};

const addNewPlayer = async (playerData) => {
    try {
        const response = await fetch(APIURL + 'players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData),
        });
        
        if (!response.ok) {
            throw new Error('Failed to add a new player');
        }
        
        const result = await response.json();
        console.log(result); // Log the response from the API
        await renderAllPlayers(); // Refresh the player list after addition
    } catch (error) {
        throw new Error(`Error adding new player: ${error.message}`);
    }
};

const init = () => {

    renderNewPlayerForm();
    renderAllPlayers();
};

init();