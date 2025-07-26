<<<<<<< HEAD
// main.js

console.log('Melody Maker: Core JavaScript Loaded - Starting Initialization...');

// --- Import functions from new feature modules ---
// Ensure these paths are correct relative to main.js
import { addRecentlyPlayed, getRecentlyPlayed } from './recentlyPlayed.js';
import { addLikedSong, removeLikedSong, isSongLiked, getLikedSongs } from './likedSongs.js';
import { createNewPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, getUserPlaylists } from './playlistManager.js';

// --- Global Variables (CRITICAL: Declared at the top level) ---
let currentSong = new Audio(); // HTML Audio element for playback
let isManuallyToggling = false; let songs = []; // Array to hold song objects for the current playlist (for playback controls)
let currFolder = ""; // Stores the path to the current song folder (e.g., "songs/ALL TIME HITS HINDI")
let songsGlobalCatalog = []; // Global catalog for search function
let currentPlayingSong = null; // Stores the full song object that is currently playing

// Navigation history for right panel views (e.g., Popular Songs, Custom Playlists)
let navigationHistory = [];
let historyPointer = -1;


// --- UI Element References (will be initialized in main to ensure DOM is ready) ---
let playButton, previousButton, nextButton, volumeRange, volumeIcon;
let songInfoDisplay, songTimeDisplay, seekbarCircle, seekbar;
let homeLink, searchLink, createPlaylistBtn, viewLikedBtn, viewRecentBtn;
let currentPlaylistTitle, songListUL, songItemsContainer;
let searchInput, searchButton;
let popularSongsSection, popularPlaylistsSection;
let likeSongBtn; // Heart icon for liking songs in the playbar
let userPlaylistsContainer, userPlaylistsDisplaySection; // Containers for custom playlists
let backBtn, forwardBtn;
let backToPlaylistsBtn, backButtonContainer;
let viewPlaylistsBtn;

// Custom modal elements (match HTML IDs)
let customModal, modalTitle, modalMessage, modalInputContainer, modalInput, modalButtons;

// For auth messages if script.js loads after main.js (optional, depends on your auth setup)
let authModal, authMessageDisplay;
let currentSongIndex = -1;


// --- Song Metadata Lookup Table (FOR EXPLICIT OVERRIDES ONLY) ---
// By default, this object is empty. The application will AUTOMATICALLY try to
// parse artist and display name from filenames in "Artist Name - Song Title.mp3" format.
//
// You ONLY need to add an entry here if:
// 1. A song's filename DOES NOT follow the "Artist Name - Song Title.mp3" format,
//    and you still want a specific artist/display name.
// 2. You want to OVERRIDE the artist/display name parsed from the filename.
//
// Example format for an override:
// "songs/FOLDER_NAME/YOUR_FILENAME.mp3": { displayName: "Custom Song Title", artist: "Custom Artist Name" },
const songsMetadata = {
    // Kept Popular Songs here as they are directly referenced by images/cards,
    // and their artist names might not be in the exact filename format.
    "songs/Popular Songs/Ishq Hai/Ishq Hai.mp3": { displayName: "Ishq Hai", artist: "Anurag Saikia" },
    "songs/Popular Songs/Leja/Leja.mp3": { displayName: "Leja", artist: "Lost Stories , JAI DHIR" },
    "songs/Popular Songs/Mera Naam Mary/Mera Naam Mary.mp3": { displayName: "Mera Naam Mary", artist: "Ajay Atul , Chinmayi" },
    "songs/Popular Songs/O Rangrez/O Rangrez.mp3": { displayName: "O Rangrez", artist: "Shankar-Ehsaan-Loy , Shreya Ghoshal" },
    "songs/Popular Songs/Shaky/Shaky.mp3": { displayName: "Shaky", artist: "Sanju Rathod" },
    "songs/Popular Songs/Rang/Rang.mp3": { displayName: "Rang", artist: "Tanishk Bagchi , Satinder Sartaaj" },
    "songs/Popular Songs/Ranu Bombay Ki Ranu/Ranu Bombay Ki Ranu.mp3": { displayName: "Ranu Bombay Ki Ranu", artist: "Ramu Rathod , Prabha" },
    // NO OTHER SONGS ARE ADDED HERE. THEY WILL BE PARSED FROM FILENAMES.
};


/**
 * Hides all main content sections in the right panel.
 */
function hideAllRightContentSections() {
    console.log("Hiding all right content sections.");
    if (popularSongsSection) popularSongsSection.style.display = 'none';
    if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'none';
    if (userPlaylistsDisplaySection) userPlaylistsDisplaySection.style.display = 'none';
}

/**
 * Displays a specific main content section in the right panel.
 * @param {string} sectionId - The ID of the right-panel section to display.
 */
function displayRightContent(sectionId) {
    console.log(`Attempting to display right content section: ${sectionId}`);
    hideAllRightContentSections();
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log(`Section '${sectionId}' displayed.`);
    } else {
        console.error(`ERROR: Target section with ID '${sectionId}' not found in DOM. Check index.html IDs.`);
    }
}


/**
 * Activates and populates the song list in the left sidebar.
 * This function updates the global 'songs' array.
 * @param {string} title - The title to display for the current song list.
 * @param {Array<Object>} songDataArray - The array of song objects to render.
 * @param {boolean} showBackButton - Whether to show the "Back to Playlists" button.
 */
function activateLeftSongList(title, songDataArray, showBackButton = false) {
    console.log(`Activating left song list with title: '${title}', songs count: ${songDataArray.length}`);
    if (currentPlaylistTitle) currentPlaylistTitle.textContent = title;
    if (songItemsContainer) {
        // Ensure the song list UL (songListUL) is visible by setting its parent container
        songItemsContainer.style.display = 'block';
    } else {
        console.error("ERROR: songItemsContainer is null. Cannot activate left song list.");
        return;
    }

    // Set the global 'songs' array to the current data being displayed in the left panel
    songs = songDataArray;
    renderSongList(songListUL, songs, true); // Render the songs to the UI, always show play button in left sidebar

    if (backButtonContainer) {
        backButtonContainer.style.display = showBackButton ? 'block' : 'none';
    } else {
        console.warn("backButtonContainer is null. Cannot show/hide back button.");
    }
}


/**
 * Updates the disabled state of the navigation buttons in the header.
 */
function updateNavigationButtons() {
    if (backBtn) {
        backBtn.disabled = historyPointer <= 0;
        backBtn.style.opacity = historyPointer <= 0 ? 0.5 : 1;
    } else {
        console.warn("backBtn is null. Cannot update navigation buttons.");
    }
    if (forwardBtn) {
        forwardBtn.disabled = historyPointer >= navigationHistory.length - 1;
        forwardBtn.style.opacity = historyPointer >= navigationHistory.length - 1 ? 0.5 : 1;
    } else {
        console.warn("forwardBtn is null. Cannot update navigation buttons.");
    }
}

/**
 * Navigates to a specified main view section, updates history, and refreshes display.
 * This function now specifically handles which RIGHT panel section to show.
 * The left panel is managed by `activateLeftSongList`.
 * @param {string} viewId - The ID of the main content section to display (e.g., 'popularSongsSection', 'userPlaylistsDisplaySection').
 */
async function navigateToView(viewId) {
    console.log(`Navigating to view: ${viewId}`);
    displayRightContent(viewId); // Show the specific right panel section

    // Manage history for RIGHT panel views only
    if (historyPointer === -1 || navigationHistory[historyPointer] !== viewId) {
        navigationHistory.splice(historyPointer + 1); // Clear forward history
        navigationHistory.push(viewId);
        historyPointer = navigationHistory.length - 1;
        console.log("Navigation History updated:", navigationHistory);
    }
    updateNavigationButtons();

    // Now, manage the LEFT sidebar's song list based on the new right panel view
    if (viewId === 'popularSongsSection') {
        // When going to Popular Songs, also show Popular Playlists
        if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block';
        const fetchedSongs = await getSongs("songs/ALL TIME HITS HINDI", "All Time Hits"); // Load default popular songs
        activateLeftSongList("All Time Hits", fetchedSongs, false); // Populate left list from the fetched `songs`
    } else if (viewId === 'userPlaylistsDisplaySection') {
        if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'none'; // Hide popular playlists if viewing custom
        if (popularSongsSection) popularSongsSection.style.display = 'none'; // Hide popular songs if viewing custom
        renderUserPlaylists(); // Render custom playlist cards in the right section
        activateLeftSongList("Select a playlist to view its songs.", [], false); // Clear left list
    }
    // For search, liked, recently played, their respective click handlers will populate the left panel directly.
}

/**
 * Navigates back in the history of main views (right panel).
 */
function goBackInHistory() {
    console.log("Going back in history. Current pointer:", historyPointer);
    if (historyPointer > 0) {
        historyPointer--;
        const previousViewId = navigationHistory[historyPointer];
        console.log("Navigating back to:", previousViewId);

        // Directly display the right panel view
        displayRightContent(previousViewId);

        // Reload default songs for left panel based on the previous view
        if (previousViewId === 'popularSongsSection') {
            if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible
            getSongs("songs/ALL TIME HITS HINDI", "All Time Hits").then(loadedSongs => {
                activateLeftSongList("All Time Hits", loadedSongs, false);
            });
        } else if (previousViewId === 'userPlaylistsDisplaySection') {
            renderUserPlaylists(); // Re-render custom playlists in the right panel
            activateLeftSongList("My Playlists", [], false); // Reset left song list
        } else {
            // Fallback for other states like search if they were in history
            activateLeftSongList("Songs", [], false); // Just clear the list
        }
        updateNavigationButtons();
    } else {
        console.log("Cannot go back further in history.");
    }
}

/**
 * Navigates forward in the history of main views (right panel).
 */
function goForwardInHistory() {
    console.log("Going forward in history. Current pointer:", historyPointer);
    if (historyPointer < navigationHistory.length - 1) {
        historyPointer++;
        const nextViewId = navigationHistory[historyPointer];
        console.log("Navigating forward to:", nextViewId);

        // Directly display the right panel view
        displayRightContent(nextViewId);

        // Reload default songs for left panel based on the next view
        if (nextViewId === 'popularSongsSection') {
            if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible
            getSongs("songs/ALL TIME HITS HINDI", "All Time Hits").then(loadedSongs => {
                activateLeftSongList("All Time Hits", loadedSongs, false);
            });
        } else if (nextViewId === 'userPlaylistsDisplaySection') {
            renderUserPlaylists(); // Re-render custom playlists in the right panel
            activateLeftSongList("My Playlists", [], false); // Reset left song list
        } else {
            // Fallback for other states like search
            activateLeftSongList("Songs", [], false); // Just clear the list
        }
        updateNavigationButtons();
    } else {
        console.log("Cannot go forward further in history.");
    }
}


/**
 * Parses the filename to extract artist and display name.
 * Assumes format "Artist Name - Song Title.mp3"
 * @param {string} fileName - The original decoded filename (e.g., "Artist Name - Song Title.mp3").
 * @returns {{displayName: string, artist: string}} Object with parsed display name and artist.
 */
function parseSongInfoFromFilename(fileName) {
    const cleanFileName = fileName.replace(/\.mp3$/, '');
    const parts = cleanFileName.split(' - '); // Split by " - " (space-hyphen-space)

    if (parts.length >= 2) {
        // Assume everything before the first " - " is the artist
        const artist = parts[0].trim();
        // Assume everything after the first " - " is the song title
        const displayName = parts.slice(1).join(' - ').trim();
        return { displayName: displayName, artist: artist };
    } else {
        // If " - " not found, use filename as display name and "Unknown Artist"
        return { displayName: cleanFileName, artist: "Unknown Artist" };
    }
}

/**
 * Converts seconds to a formatted MM:SS string.
 * @param {number} seconds - The time in seconds.
 * @returns {string} Formatted time string (e.g., "03:45").
 */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Displays a custom modal dialog.
 * @param {object} options - Configuration for the modal.
 * @param {string} options.title - The title of the modal.
 * @param {string} options.message - The message content of the modal.
 * @param {Array<object>} options.buttons - An array of button objects.
 * @param {string} options.buttons[].text - The text displayed on the button.
 * @param {string} options.buttons[].class - CSS class for the button (e.g., 'btn-primary', 'btn-danger').
 * @param {function} options.buttons[].onClick - The function to execute when the button is clicked.
 * @param {boolean} [options.showInput=false] - Whether to show an input field in the modal.
 */
function showCustomModal({ title, message, buttons, showInput = false }) {
    console.log(`Showing modal: ${title}`);
    if (!customModal || !modalTitle || !modalMessage || !modalButtons || !modalInputContainer || !modalInput) {
        console.error("ERROR: Custom modal elements not found in DOM (showCustomModal). Check index.html IDs.");
        return;
    }

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalButtons.innerHTML = '';
    modalInput.value = ''; // Clear input field
    modalInputContainer.style.display = showInput ? 'block' : 'none'; // Show/hide input

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.className = `btn ${button.class}`;
        btn.onclick = button.onClick;
        modalButtons.appendChild(btn);
    });

    customModal.style.display = 'flex'; // Show the modal
    customModal.classList.remove('hidden'); // Ensure it's visible if CSS uses 'hidden' class
    // Add backdrop if it exists
    const modalBackdrop = document.getElementById('customModalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('hidden');
    }
}

/**
 * Hides the custom modal dialog.
 */
function hideCustomModal() {
    console.log("Hiding modal.");
    if (customModal) {
        customModal.style.display = 'none';
        customModal.classList.add('hidden'); // Add 'hidden' class back
    }
    // Also hide backdrop
    const modalBackdrop = document.getElementById('customModalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.add('hidden');
    }
}


/**
 * Fetches songs from a specified folder.
 * This function updates the global `songs` array directly.
 * @param {string} folderPath - The path to the folder containing MP3s (e.g., "songs/ALL TIME HITS HINDI").
 * @param {string} [displayTitle] - Optional title to display in the left sidebar.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of song objects.
 */
async function getSongs(folderPath, displayTitle = null) {
    currFolder = folderPath;
    console.log(`Attempting to fetch directory listing from: /${folderPath}/`);
    try {
        let response = await fetch(`/${folderPath}/`);

        if (!response.ok) {
            console.error(`FETCH ERROR: Failed to fetch directory listing for ${folderPath}. Status: ${response.status} ${response.statusText}.`);
            console.error("Possible reasons: 1. No local web server running. 2. Incorrect folder path. 3. Server doesn't allow directory listing (e.g., Apache/Nginx default configuration). 4. CORS issue.");
            return [];
        }
        let responseText = await response.text();
        console.log(`Successfully fetched directory listing for ${folderPath}. Parsing songs...`);

        let div = document.createElement("div");
        div.innerHTML = responseText;

        let anchors = div.getElementsByTagName("a");
        let newSongs = [];

        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            // Filter for MP3 files and exclude parent directory links
            if (anchor.href.endsWith(".mp3") && !anchor.textContent.includes("Parent Directory")) {
                // Use URL object to correctly parse the pathname and get the last segment
                let rawFileName = new URL(anchor.href).pathname.split('/').pop();
                rawFileName = decodeURIComponent(rawFileName); // Fully decode filename

                const fullSongPathForMetadata = `${folderPath}/${rawFileName}`; // Create full path for lookup

                let songInfo = songsMetadata[fullSongPathForMetadata];

                if (!songInfo) {
                    songInfo = parseSongInfoFromFilename(rawFileName); // Pass decoded filename
                }

                // Check if song already exists in newSongs array to prevent duplicates
                const exists = newSongs.some(s =>
                    s.originalFileName === rawFileName && s.folderPath === folderPath
                );
                if (!exists) {
                    newSongs.push({
                        originalFileName: rawFileName, // Store the decoded filename
                        displayName: songInfo.displayName,
                        artist: songInfo.artist,
                        folderPath: folderPath // Store folder path with song object
                    });
                }
            }
        }
        // IMPORTANT: Directly set the global `songs` array here as this is the source
        // for the current list of playable songs for the playbar controls.
        songs = newSongs;
        console.log(`Loaded ${songs.length} songs into global 'songs' array from ${folderPath}:`, songs);

        return songs; // Return the loaded songs
    } catch (error) {
        console.error("CRITICAL ERROR during getSongs fetch/parsing:", error);
        console.error("This could be a network issue, CORS, or a problem with the URL you're trying to fetch (e.g., server doesn't allow directory listing, or is serving an incorrect format for the directory listing).");
        showCustomModal({
            title: "Loading Error",
            message: `Failed to load songs from '${folderPath}'. Please ensure the folder exists on your server and contains valid MP3 files, and your server allows directory listing.`,
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return [];
    }
}


/**
 * Renders a list of songs into a specified UL element.
 * @param {HTMLElement} ulElement - The <ul> element to populate.
 * @param {Array<Object>} songDataArray - Array of song objects ({originalFileName, displayName, artist, folderPath}).
 * @param {boolean} showPlayButton - Whether to show the play now button beside each song.
 */
function renderSongList(ulElement, songDataArray, showPlayButton = true) {
    console.log(`Rendering song list to UI. Target UL: ${ulElement ? 'Exists' : 'NULL'}, Songs count: ${songDataArray.length}`);
    if (!ulElement) {
        console.error("ERROR: Target UL element (songListUL) is null. Cannot render songs to UI.");
        return;
    }

    ulElement.innerHTML = ""; // Clear current list
    if (songDataArray.length === 0) {
        ulElement.innerHTML = `<li class="p-1 text-center" style="color: #b3b3b3; font-style: italic;">No songs to display.</li>`;
        return;
    }

    songDataArray.forEach(song => {
        const isCurrentlyLiked = isSongLiked(song);
        const heartIconSrc = isCurrentlyLiked ? "img/heart-filled.svg" : "img/heart.svg";
        const heartIconClass = isCurrentlyLiked ? "liked" : "";

        const encodedOriginalFileName = encodeURIComponent(song.originalFileName);
        const encodedFolderPath = encodeURIComponent(song.folderPath);

        ulElement.innerHTML += `<li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div> ${song.displayName}</div>
                <div>${song.artist}</div>
            </div>
            ${showPlayButton ? `
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert play-icon" src="img/play.svg" alt="Play Song">
                <img class="invert song-list-heart-icon ${heartIconClass}" data-original-filename="${encodedOriginalFileName}" data-folder-path="${encodedFolderPath}" src="${heartIconSrc}" alt="Like Song">
                <img class="invert add-to-playlist-icon" src="img/plus.svg" alt="Add to Playlist" title="Add to Playlist" style="width:20px;height:20px;margin-left:6px;cursor:pointer;">
            </div>` : ''}
        </li>`;
    });

    // Attach event listeners for each song item and its icons
    Array.from(ulElement.querySelectorAll("li")).forEach((li, index) => {
        const songForThisListItem = songDataArray[index];
        if (!songForThisListItem) {
            console.error("Could not find song object for list item at index:", index);
            return;
        }

        const heartIcon = li.querySelector('.song-list-heart-icon');
        const playIcon = li.querySelector('.play-icon');
        const addBtn = li.querySelector('.add-to-playlist-icon');

        // Like/unlike
        if (heartIcon) {
            heartIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                if (isSongLiked(songForThisListItem)) {
                    removeLikedSong(songForThisListItem);
                    heartIcon.classList.remove('liked');
                    heartIcon.src = "img/heart.svg";
                } else {
                    addLikedSong(songForThisListItem);
                    heartIcon.classList.add('liked');
                    heartIcon.src = "img/heart-filled.svg";
                }
                if (currentPlaylistTitle && currentPlaylistTitle.textContent === "Liked Songs") renderLikedSongs();
                if (currentPlayingSong &&
                    currentPlayingSong.originalFileName === songForThisListItem.originalFileName &&
                    currentPlayingSong.folderPath === songForThisListItem.folderPath) {
                    if (isSongLiked(currentPlayingSong)) {
                        likeSongBtn.classList.add('liked');
                        likeSongBtn.src = "img/heart-filled.svg";
                    } else {
                        likeSongBtn.classList.remove('liked');
                        likeSongBtn.src = "img/heart.svg";
                    }
                }
            });
        }

        // Play
        if (playIcon) {
            playIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                playMusic(songForThisListItem);
            });
        }

        // Add to playlist
        if (addBtn) {
            addBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                showAddToPlaylistModal(songForThisListItem);
            });
        }

        // List item click (play)
        li.addEventListener("click", (event) => {
            if (
                event.target.closest('.playnow') ||
                event.target.closest('.song-list-heart-icon') ||
                event.target.closest('.add-to-playlist-icon')
            ) {
                return;
            }
            playMusic(songForThisListItem);
        });
    });
}

function showAddToPlaylistModal(song) {
    const playlists = getUserPlaylists();
    if (playlists.length === 0) {
        showCustomModal({
            title: "No Playlists",
            message: "You have no playlists. Create one first!",
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return;
    }

    // If only one playlist, add directly and show confirmation
    if (playlists.length === 1) {
        const playlist = playlists[0];
        const added = addSongToPlaylist(playlist.id, song);
        showCustomModal({
            title: added ? "Song Added" : "Already Exists",
            message: added
                ? `'${song.displayName}' added to playlist '${playlist.name}'.`
                : `'${song.displayName}' is already in that playlist.`,
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return;
    }

    // For multiple playlists, build the list as HTML
    let playlistOptions = playlists.map(pl =>
        `<li data-playlist-id="${pl.id}" style="padding:10px;cursor:pointer;border-bottom:1px solid #222;">
            ${pl.name} <span style="color:#b3b3b3;font-size:0.9em;">(${pl.songs.length} songs)</span>
        </li>`
    ).join('');
    const playlistListHTML = `<ul style="list-style:none;padding:0;margin:0;">${playlistOptions}</ul>`;

    // Show the modal first
    showCustomModal({
        title: "Add to Playlist",
        message: playlistListHTML,
        buttons: [{ text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }]
    });

    // Attach click listeners AFTER the modal is rendered
    setTimeout(() => {
        document.querySelectorAll('#modalMessage ul li').forEach(li => {
            li.addEventListener('click', () => {
                const playlistId = li.getAttribute('data-playlist-id');
                const added = addSongToPlaylist(playlistId, song);
                hideCustomModal();
                showCustomModal({
                    title: added ? "Song Added" : "Already Exists",
                    message: added
                        ? `'${song.displayName}' added to playlist '${li.textContent.split(' (')[0]}'.`
                        : `'${song.displayName}' is already in that playlist.`,
                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                });
            });
        });
    }, 0); // Ensures DOM is updated before attaching listeners
}




/**
 * Plays a given track.
 * @param {object} songObj - The song object to play ({originalFileName, displayName, artist, folderPath}).
 * @param {boolean} [pause=false] - If true, loads the song but keeps it paused.
 */
const playMusic = (songObj, pause = false) => {
    console.log(`Attempting to play music: ${songObj ? songObj.displayName : 'Invalid Song Object'}`);
    if (!songObj || !songObj.folderPath || !songObj.originalFileName) {
        console.error("ERROR: Invalid song object provided to playMusic. Missing folderPath or originalFileName:", songObj);
        if (songInfoDisplay) songInfoDisplay.innerHTML = "Error: Invalid Song";
        currentSong.pause();
        if (playButton) playButton.src = "img/play.svg";
        currentPlayingSong = null; // Ensure currentPlayingSong is cleared on error
        return;
    }

    currFolder = songObj.folderPath;

    // Construct the full URL to the MP3 file.
    // Both folderPath and originalFileName should be correctly URL-encoded.
    const encodedFolderPath = encodeURIComponent(songObj.folderPath).replace(/%2F/g, '/'); // Ensure slashes stay as slashes
    const encodedFileName = encodeURIComponent(songObj.originalFileName);

    const fullAudioSrc = `/${encodedFolderPath}/${encodedFileName}`;
    currentSong.src = fullAudioSrc;
    console.log("Setting Audio src to:", currentSong.src);
    currentPlayingSong = songObj;

    currentSongIndex = songs.findIndex(s =>
        s.originalFileName === songObj.originalFileName &&
        s.folderPath === songObj.folderPath
    );

    // Update playbar heart icon based on the liked status of the new current song
    if (likeSongBtn) {
        if (isSongLiked(currentPlayingSong)) {
            likeSongBtn.classList.add('liked');
            likeSongBtn.src = "img/heart-filled.svg";
        } else {
            likeSongBtn.classList.remove('liked');
            likeSongBtn.src = "img/heart.svg";
        }
    } else {
        console.warn("likeSongBtn not found in DOM.");
    }

    if (!pause) {
        currentSong.play()
            .then(() => {
                if (playButton) playButton.src = "img/pause.svg";
                console.log("Song playback initiated successfully for:", songObj.displayName);
                addRecentlyPlayed(songObj); // Add to recently played only on successful playback
            })
            .catch(error => {
                console.error("ERROR playing music:", error);
                let errorMessage = `Could not play '${songObj.displayName}'.`;
                if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
                    console.log("Autoplay blocked, but silently handled.");
                    return; // Exit without showing modal
                } else if (error.name === 'NetworkError' || error.message.includes('404')) {

                } else if (error.name === 'NetworkError' || error.message.includes('404')) {
                    errorMessage += ` File not found or network issue. Please check the song path: "${currentSong.src}" and ensure the file exists on your server.`;
                    console.error(`Network error or song not found (404). Check the song path in Network tab: ${currentSong.src}. Error details:`, error);
                } else if (error.name === 'NotSupportedError') {
                    errorMessage += " Audio format might not be supported or the file is corrupted.";
                    console.error(`NotSupportedError: The audio format might not be supported or the file is corrupted. Source: ${currentSong.src}. Error details:`, error);
                } else {
                    errorMessage += ` Unknown playback error: ${error.message || error.name}`;
                    console.error("Unknown playback error details:", error);
                }

                if (playButton) playButton.src = "img/play.svg";
                currentPlayingSong = null; // Clear current playing song on error
                showCustomModal({ title: "Playback Error", message: errorMessage, buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }] });
            });
    } else {
        if (playButton) playButton.src = "img/play.svg";
        console.log("Song loaded but paused as requested.");
    }

    if (songInfoDisplay) songInfoDisplay.innerHTML = songObj.displayName;
    if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
};


/**
 * Attaches click listeners to all existing playlist/song cards in the HTML.
 */
function setupCardClickListeners() {
    console.log("Setting up click listeners for all existing HTML cards.");

    Array.from(document.querySelectorAll(".spotifySong .card, .spotifyPlaylists .card")).forEach(cardElement => {
        cardElement.addEventListener("click", async () => {
            let folderPathSuffix = cardElement.dataset.folder;
            let displayTitle = cardElement.querySelector('h2') ? cardElement.querySelector('h2').textContent : 'Unknown Playlist';

            if (folderPathSuffix) {
                let fullFolderPath = `songs/${folderPathSuffix}`;
                console.log(`Clicked card. Attempting to fetch songs from: ${fullFolderPath}`);

                const fetchedSongs = await getSongs(fullFolderPath, displayTitle);

                // Only show back button if it's a popular playlist card.
                const showBackButtonForCard = cardElement.closest('#popularPlaylistsSection') ? true : false;

                activateLeftSongList(displayTitle, fetchedSongs, showBackButtonForCard);

                // Autoplay after click, but add a small delay to avoid AbortError on very fast interaction
                if (fetchedSongs.length > 0) {
                    // Attempt to play the first song.
                    // This is still subject to browser autoplay policies.
                    setTimeout(() => {
                        console.log(`Attempting autoplay of first song from card click: ${fetchedSongs[0].displayName}`);
                        playMusic(fetchedSongs[0]);
                    }, 100); // 100ms delay
                } else {
                    console.warn(`No songs found in folder: ${fullFolderPath}. Will not start playback.`);
                    if (songInfoDisplay) songInfoDisplay.innerHTML = "No songs in playlist";
                    if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
                    if (playButton) playButton.src = "img/play.svg";
                    currentPlayingSong = null; // Ensure currentPlayingSong is cleared
                }
            } else {
                console.error("Clicked card is missing 'data-folder' attribute. Cannot load songs for playback.");
            }
        });
    });
}


/**
 * Builds a comprehensive catalog of all songs available for simple client-side search.
 */
async function buildAllSongsCatalog() {
    console.log("Building all songs catalog...");
    const topLevelSongFolders = [
        "songs/ALL TIME HITS HINDI",
        "songs/Telugu Hits",
        "songs/OLD SONGS",
        "songs/Bollywood Dance Music",
        "songs/Bollywood 2000s",
        "songs/Insta Hits",
        "songs/Latest Songs",
        "songs/Bhakti Songs",
        "songs/Cartoon Songs",
        "songs/Patriotic Songs",
    ];

    const popularSongFolders = [
        "songs/Popular Songs/Ishq Hai",
        "songs/Popular Songs/Leja",
        "songs/Popular Songs/Mera Naam Mary",
        "songs/Popular Songs/O Rangrez",
        "songs/Popular Songs/Shaky",
        "songs/Popular Songs/Rang",
        "songs/Popular Songs/Ranu Bombay Ki Ranu",
        "songs/Sooseki",
        "songs/Kurchi Madathapetti",
        "songs/Laal Peeli Akhiyaan",
        "songs/Tauba Tauba",
        "songs/Die With A Smile",
        "songs/Teri Baaton Mein Aisa Uljha Jiya",
        "songs/Banni",
        "songs/Chaudhary",
    ];

    const allFoldersToCatalog = [...topLevelSongFolders, ...popularSongFolders];

    let tempAllSongs = [];

    for (const folder of allFoldersToCatalog) {
        try {
            const response = await fetch(`/${folder}/`);
            if (response.ok) {
                const responseText = await response.text();
                const div = document.createElement("div");
                div.innerHTML = responseText;
                Array.from(div.getElementsByTagName("a")).forEach(anchor => {
                    if (anchor.href.endsWith(".mp3") && !anchor.textContent.includes("Parent Directory")) {
                        let rawFileName = new URL(anchor.href).pathname.split('/').pop();
                        rawFileName = decodeURIComponent(rawFileName); // Decode filename

                        const fullSongPathForMetadata = `${folder}/${rawFileName}`;

                        let songInfo = songsMetadata[fullSongPathForMetadata];

                        if (!songInfo) {
                            songInfo = parseSongInfoFromFilename(rawFileName); // Pass decoded filename
                        }

                        const exists = tempAllSongs.some(s =>
                            s.originalFileName === rawFileName && s.folderPath === folder
                        );
                        if (!exists) {
                            tempAllSongs.push({
                                originalFileName: rawFileName,
                                displayName: songInfo.displayName,
                                artist: songInfo.artist,
                                folderPath: folder
                            });
                        }
                    }
                });
            } else {
                console.warn(`WARNING: Failed to fetch songs from ${folder} for catalog: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn(`ERROR during catalog building for ${folder}:`, error);
        }
    }
    tempAllSongs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    songsGlobalCatalog = tempAllSongs;
    console.log("All songs catalog built:", songsGlobalCatalog.length, "songs.");
}


/**
 * Renders user-created playlists in the specified container.
 */
function renderUserPlaylists() {
    console.log("Attempting to render user playlists.");
    if (!userPlaylistsContainer) {
        console.error("ERROR: userPlaylistsContainer is null. Cannot render user playlists.");
        return;
    }

    userPlaylistsContainer.innerHTML = ''; // Clear existing content

    const playlists = getUserPlaylists();
    console.log("Fetched user playlists for rendering:", playlists.length, playlists);

    if (playlists.length === 0) {
        userPlaylistsContainer.innerHTML = `<p class="text-center-placeholder">No custom playlists created yet. Click 'Create playlist' above!</p>`;
        return;
    }

    const playlistListHTML = playlists.map(playlist => `
        <div class="user-playlist-card" data-playlist-id="${playlist.id}" data-playlist-name="${playlist.name}">
            <div class="playlist-image-placeholder">
            
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="musicGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#a259f7"/>
      <stop offset="1" stop-color="#fc5c7d"/>
    </linearGradient>
  </defs>
  <rect x="3" y="5" width="18" height="14" rx="3" fill="url(#musicGradient)"/>
  <path d="M7 9h10M7 13h6" stroke="#ffe29f" stroke-width="2" stroke-linecap="round"/>
  <circle cx="9" cy="17" r="1.5" fill="#fc5c7d"/>
  <circle cx="15" cy="17" r="1.5" fill="#fc5c7d"/>
</svg>

            </div>
            <h3>${playlist.name}</h3>
            <p>${playlist.songs.length} songs</p>
            <div class="user-playlist-actions">
                <button class="btn-sm btn-view-playlist">View</button>
                <button class="btn-sm btn-delete-playlist">Delete</button>
                <button class="btn-sm btn-add-song-to-playlist" title="Add current song to this playlist">Add Current</button>
            </div>
            <div class="user-playlist-songs-list" style="display: none;"></div> <!-- Keep this, but it will always be hidden via CSS -->
        </div>
    `).join('');

    userPlaylistsContainer.innerHTML = playlistListHTML;
    console.log("User playlist HTML rendered.");

    // Add event listeners for new playlist cards
    document.querySelectorAll('.user-playlist-card').forEach(card => {
        const playlistId = card.dataset.playlistId;
        const playlistName = card.dataset.playlistName;

        const viewBtn = card.querySelector('.btn-view-playlist');
        if (viewBtn) {
            viewBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`View playlist button clicked for: ${playlistName}. Displaying songs in left sidebar.`);

                const playlist = getUserPlaylists().find(p => p.id === playlistId);
                if (playlist) {
                    activateLeftSongList(playlistName, playlist.songs, true);
                    // No need to set display block on .user-playlist-songs-list or render into it here
                    if (playlist.songs.length > 0) {
                        setTimeout(() => {
                            playMusic(playlist.songs[0]); // Autoplay first song in playlist
                        }, 100);
                    } else {
                        if (songInfoDisplay) songInfoDisplay.innerHTML = "No songs in playlist";
                        if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
                        if (playButton) playButton.src = "img/play.svg";
                        currentPlayingSong = null; // Ensure currentPlayingSong is cleared
                    }
                } else {
                    console.error(`Playlist with ID ${playlistId} not found when trying to view.`);
                }
            });
        } else {
            console.warn(`View button not found for playlist card: ${playlistName}`);
        }


        const deleteBtn = card.querySelector('.btn-delete-playlist');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`Delete playlist button clicked for: ${playlistName}`);
                showCustomModal({
                    title: "Confirm Deletion",
                    message: `Are you sure you want to delete playlist '${playlistName}'? This action cannot be undone.`,
                    buttons: [
                        {
                            text: "Delete", class: "btn-danger", onClick: () => {
                                console.log(`Confirmed deletion of playlist with ID: ${playlistId}`);
                                const deleted = deletePlaylist(playlistId); // This is the call to playlistManager's function
                                hideCustomModal(); // Hide the confirmation modal
                                if (deleted) {
                                    renderUserPlaylists(); // Re-render to update the display
                                    showCustomModal({ // Show a new modal for 'Playlist Deleted'
                                        title: "Playlist Deleted",
                                        message: `'${playlistName}' has been deleted.`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                    // If the deleted playlist's songs were in the left sidebar, clear them
                                    if (currentPlaylistTitle && currentPlaylistTitle.textContent === playlistName) {
                                        activateLeftSongList("Select a playlist to view its songs.", [], false);
                                        currentPlayingSong = null; // Clear current playing song if it was from deleted playlist
                                    }
                                } else {
                                    showCustomModal({
                                        title: "Deletion Failed",
                                        message: `Could not delete playlist '${playlistName}'. It might not exist.`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                }
                            }
                        },
                        { text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }
                    ]
                });
            });
        } else {
            console.warn(`Delete button not found for playlist card: ${playlistName}`);
        }


        const addCurrentBtn = card.querySelector('.btn-add-song-to-playlist');
        if (addCurrentBtn) {
            addCurrentBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`Add Current Song button clicked for: ${playlistName}`);
                if (currentPlayingSong) {
                    const songToAdd = {
                        originalFileName: currentPlayingSong.originalFileName,
                        displayName: currentPlayingSong.displayName,
                        artist: currentPlayingSong.artist,
                        folderPath: currentPlayingSong.folderPath
                    };
                    const added = addSongToPlaylist(playlistId, songToAdd);
                    renderUserPlaylists(); // Re-render to update song count on the card
                    if (added) {
                        showCustomModal({
                            title: "Song Added",
                            message: `'${currentPlayingSong.displayName}' added to playlist '${playlistName}'.`,
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    } else {
                        showCustomModal({
                            title: "Already Exists",
                            message: `'${currentPlayingSong.displayName}' is already in playlist '${playlistName}'.`,
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    }
                } else {
                    showCustomModal({
                        title: "No Song Playing",
                        message: "No song is currently playing to add to playlist.",
                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                    });
                }
            });
        } else {
            console.warn(`Add Current Song button not found for playlist card: ${playlistName}`);
        }
    });
}


/**
 * Renders the liked songs list into the main songListUL in the left sidebar.
 */
function renderLikedSongs() {
    console.log("Rendering liked songs.");
    const liked = getLikedSongs();
    activateLeftSongList("Liked Songs", liked, false);
}


/**
 * Renders the recently played songs list into the main songListUL in the left sidebar.
 */
function renderRecentlyPlayed() {
    console.log("Rendering recently played songs.");
    const recent = getRecentlyPlayed();
    activateLeftSongList("Recently Played", recent, false);
}


// --- Main Application Logic Entry Point ---
async function main() {
    console.log("main() function started.");

    // --- Initialize UI Element References (ensure DOM is ready) ---
    playButton = document.getElementById("play");
    previousButton = document.getElementById("previous");
    nextButton = document.getElementById("next");
    volumeRange = document.getElementById("volumeControl");
    volumeIcon = document.querySelector(".volume > img");
    songInfoDisplay = document.querySelector(".songinfo");
    songTimeDisplay = document.querySelector(".songtime");
    seekbarCircle = document.querySelector(".circle");
    seekbar = document.querySelector(".seekbar");
    homeLink = document.getElementById("homeLink");
    searchLink = document.getElementById("searchLink");
    createPlaylistBtn = document.getElementById("createPlaylistBtn");
    viewLikedBtn = document.getElementById("viewLikedBtn");
    viewRecentBtn = document.getElementById("viewRecentBtn");
    currentPlaylistTitle = document.getElementById("currentPlaylistTitle");
    songListUL = document.querySelector(".songList .song-items-container ul");
    songItemsContainer = document.getElementById("songItemsContainer"); // Ensure this ID is present in index.html
    searchInput = document.getElementById("searchInput");
    searchButton = document.getElementById("searchButton");
    popularSongsSection = document.getElementById("popularSongsSection"); // Ensure this ID is present in index.html
    popularPlaylistsSection = document.getElementById("popularPlaylistsSection"); // Ensure this ID is present in index.html
    likeSongBtn = document.getElementById("likeSongBtn");
    userPlaylistsContainer = document.getElementById("userPlaylistsContainer");
    userPlaylistsDisplaySection = document.getElementById('userPlaylistsDisplaySection'); // Ensure this ID is present in index.html
    viewPlaylistsBtn = document.getElementById("viewPlaylistsBtn");

    backBtn = document.getElementById("backBtn");
    forwardBtn = document.getElementById("forwardBtn");
    backToPlaylistsBtn = document.getElementById('backToPlaylistsBtn');
    backButtonContainer = document.getElementById('backButtonContainer');

    customModal = document.getElementById('customModal');
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalInputContainer = document.getElementById('modalInputContainer');
    modalInput = document.getElementById('modalInput');
    modalButtons = document.getElementById('modalButtons');

    // Check if essential elements are found
    if (!playButton || !songListUL || !popularSongsSection || !popularPlaylistsSection || !userPlaylistsDisplaySection ||
        !homeLink || !searchLink || !createPlaylistBtn || !viewLikedBtn || !viewRecentBtn || !currentPlaylistTitle ||
        !songItemsContainer || !searchInput || !searchButton || !likeSongBtn || !userPlaylistsContainer ||
        !backBtn || !forwardBtn || !backToPlaylistsBtn || !backButtonContainer ||
        !customModal || !modalTitle || !modalMessage || !modalInputContainer || !modalInput || !modalButtons
    ) {
        console.error("CRITICAL ERROR: One or more essential UI elements not found. Check index.html IDs. Full list of missing elements below:");
        const missing = {
            playButton: playButton, previousButton: previousButton, nextButton: nextButton, volumeRange: volumeRange, volumeIcon: volumeIcon,
            songInfoDisplay: songInfoDisplay, songTimeDisplay: songTimeDisplay, seekbarCircle: seekbarCircle, seekbar: seekbar,
            homeLink: homeLink, searchLink: searchLink, createPlaylistBtn: createPlaylistBtn, viewLikedBtn: viewLikedBtn, viewRecentBtn: viewRecentBtn,
            currentPlaylistTitle: currentPlaylistTitle, songListUL: songListUL, songItemsContainer: songItemsContainer,
            searchInput: searchInput, searchButton: searchButton, popularSongsSection: popularSongsSection, popularPlaylistsSection: popularPlaylistsSection,
            likeSongBtn: likeSongBtn, userPlaylistsContainer: userPlaylistsContainer, userPlaylistsDisplaySection: userPlaylistsDisplaySection,
            backBtn: backBtn, forwardBtn: forwardBtn, backToPlaylistsBtn: backToPlaylistsBtn, backButtonContainer: backButtonContainer,
            customModal: customModal, modalTitle: modalTitle, modalMessage: modalMessage, modalInputContainer: modalInputContainer, modalInput: modalInput, modalButtons: modalButtons
        };
        for (const key in missing) {
            if (!missing[key]) {
                console.error(`- Missing: ${key}`);
            }
        }

        return; // Stop execution if core elements are missing
    }

    if (viewPlaylistsBtn) {
        viewPlaylistsBtn.addEventListener("click", () => {
            console.log("View Playlists button clicked. Navigating to user playlists section.");
            navigateToView('userPlaylistsDisplaySection');
        });
    } else {
        console.error("View Playlists button not found.");
    }

    // Build the catalog of all songs available for search
    await buildAllSongsCatalog();

    // Initial load: Display popular songs/playlists in the right panel
    displayRightContent('popularSongsSection'); // Show popular songs section initially
    popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible


    // Initial load: Load default popular songs into the left sidebar
    // DO NOT autoplay on initial page load. User interaction is required for playback.
    console.log("Initial load: Fetching default popular songs for left sidebar (no autoplay on load).");
    const initialSongs = await getSongs("songs/ALL TIME HITS HINDI", "All Time Hits");
    activateLeftSongList("All Time Hits", initialSongs, false); // Populate left list from the fetched 'songs' array

    // Initial history state for right panel
    navigationHistory.push('popularSongsSection'); // Start history with popular songs
    historyPointer = 0;
    updateNavigationButtons();


    // Setup listeners for the playlist cards on the right (so clicking them works)
    setupCardClickListeners();

    // --- Playbar Controls Event Listeners ---
    if (playButton) {
        playButton.addEventListener("click", async () => {
            if (isManuallyToggling) return;
            isManuallyToggling = true;

            try {
                console.log("Play/Pause button clicked.");
                if (currentSong.paused || currentSong.ended) {
                    if (currentPlayingSong) {
                        console.log("Resuming playback of current song.");
                        await currentSong.play();
                        playButton.src = "img/pause.svg";
                    } else if (songs.length > 0) {
                        console.log("No current song, attempting to play first in list.");
                        playMusic(songs[0]);
                    } else {
                        console.warn("Play button clicked, but no song is loaded and current 'songs' array is empty.");
                        showCustomModal({
                            title: "No Song Selected",
                            message: "Please select a song from the list to play.",
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    }
                } else {
                    console.log("Pausing playback.");
                    currentSong.pause();
                    playButton.src = "img/play.svg";
                }
            } catch (error) {
                console.error("Playback toggle error:", error);
                playButton.src = "img/play.svg";
            } finally {
                setTimeout(() => { isManuallyToggling = false; }, 300);
            }
        });
    } else {
        console.error("Play button not found.");
    }


    currentSong.addEventListener("timeupdate", () => {
        if (songTimeDisplay && seekbarCircle && !isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            songTimeDisplay.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            seekbarCircle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        } else if (!isFinite(currentSong.duration)) {
            console.warn("Song duration is not finite (likely not loaded fully yet).");
        }
    });

    currentSong.addEventListener("ended", () => {
        console.log("Current song ended.");
        if (songs.length === 0) {
            console.log("Playlist is empty, stopping playback.");
            currentPlayingSong = null;
            if (playButton) playButton.src = "img/play.svg";
            if (songInfoDisplay) songInfoDisplay.innerHTML = "";
            return;
        }

        const currentIndex = songs.findIndex(s =>
            s.originalFileName === currentPlayingSong.originalFileName &&
            s.folderPath === currentPlayingSong.folderPath
        );

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % songs.length;
            console.log(`Playing next song at index: ${nextIndex}`);
            playMusic(songs[nextIndex]);
        } else {
            console.warn("Current song not found in the list, playing first song if available.");
            if (songs.length > 0) {
                playMusic(songs[0]);
            } else {
                console.warn("Song ended, but no next song found in the current playlist.");
                currentPlayingSong = null;
                if (playButton) playButton.src = "img/play.svg";
                if (songInfoDisplay) songInfoDisplay.innerHTML = "";
            }
        }
    });

    if (seekbar) {
        seekbar.addEventListener("click", e => {
            console.log("Seekbar clicked.");
            if (currentSong.duration && !isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                if (seekbarCircle) seekbarCircle.style.left = percent + "%";
                currentSong.currentTime = ((currentSong.duration) * percent) / 100;
            } else {
                console.warn("Cannot seek: song duration is not available or invalid.");
            }
        });
    } else { console.error("Seekbar not found."); }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (songs.length === 0) return;
            let newIndex = currentSongIndex - 1;
            if (newIndex < 0) newIndex = songs.length - 1;
            playMusic(songs[newIndex]);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (songs.length === 0) return;
            let newIndex = currentSongIndex + 1;
            if (newIndex >= songs.length) newIndex = 0;
            playMusic(songs[newIndex]);
        });
    }

    if (volumeRange) {
        volumeRange.addEventListener("input", (e) => {
            currentSong.volume = parseFloat(e.target.value) / 100;
            if (volumeIcon) volumeIcon.src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
        });
    } else { console.error("Volume range not found."); }

    if (volumeIcon) {
        volumeIcon.addEventListener("click", (e) => {
            console.log("Volume icon clicked.");
            if (currentSong.volume === 0) {
                currentSong.volume = 0.10;
                if (volumeRange) volumeRange.value = 10;
                e.target.src = "img/volume.svg";
            } else {
                currentSong.volume = 0;
                if (volumeRange) volumeRange.value = 0;
                e.target.src = "img/mute.svg";
            }
        });
    } else { console.error("Volume icon not found."); }

    // Like Song button functionality (in playbar)
    if (likeSongBtn) {
        likeSongBtn.addEventListener('click', () => {
            console.log("Like song button clicked in playbar.");
            if (currentPlayingSong) {
                if (isSongLiked(currentPlayingSong)) {
                    removeLikedSong(currentPlayingSong);
                    likeSongBtn.classList.remove('liked');
                    likeSongBtn.src = "img/heart.svg"; // Update icon visual
                } else {
                    addLikedSong(currentPlayingSong);
                    likeSongBtn.classList.add('liked');
                    likeSongBtn.src = "img/heart-filled.svg"; // Update icon visual
                }
                // If the liked songs list is currently displayed in the left sidebar, re-render it
                if (currentPlaylistTitle && currentPlaylistTitle.textContent === "Liked Songs") {
                    console.log("Re-rendering Liked Songs list after like/unlike in playbar.");
                    renderLikedSongs();
                }
            } else {
                showCustomModal({
                    title: "No Song Playing",
                    message: "No song is currently playing to like.",
                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                });
            }
        });
    } else { console.error("Like song button not found."); }

    // --- UI Navigation & Action Buttons (using new display logic) ---
    if (homeLink) {
        homeLink.addEventListener("click", async () => {
            console.log("Home link clicked.");
            await navigateToView('popularSongsSection');
        });
    } else { console.error("Home link not found."); }


    if (searchLink) {
        searchLink.addEventListener("click", () => {
            console.log("Search link clicked.");
            displayRightContent('popularSongsSection');
            popularPlaylistsSection.style.display = 'block';

            activateLeftSongList("Search for songs...", [], false);
            if (searchInput) searchInput.focus();

            // No change to history behavior for search as it re-displays popular section
            if (navigationHistory[historyPointer] !== 'popularSongsSection') {
                navigationHistory.splice(historyPointer + 1);
                navigationHistory.push('popularSongsSection');
                historyPointer = navigationHistory.length - 1;
                updateNavigationButtons();
            }
        });
    } else { console.error("Search link not found."); }


    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener("click", () => {
            console.log("Create Playlist button clicked.");
            // 1. First, navigate to the user playlists section
            navigateToView('userPlaylistsDisplaySection');

            // 2. Clear the left song list and hide the back button (this is done by navigateToView's call to activateLeftSongList)
            // 3. Then, open the modal for creating a new playlist
            showCustomModal({
                title: "Create New Playlist",
                message: `Enter a name for your new playlist:`,
                showInput: true,
                buttons: [
                    {
                        text: "Create", class: "btn-primary", onClick: () => {
                            const playlistName = modalInput.value.trim();
                            if (playlistName) {
                                const newPlaylist = createNewPlaylist(playlistName);
                                if (newPlaylist) {
                                    hideCustomModal();
                                    showCustomModal({
                                        title: "Playlist Created",
                                        message: `Playlist '${newPlaylist.name}' created!`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                    renderUserPlaylists(); // Re-render user playlists immediately after creation
                                } else {
                                    hideCustomModal();
                                    showCustomModal({
                                        title: "Error",
                                        message: "Failed to create playlist. It might already exist (check console for details).",
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                }
                            } else {
                                hideCustomModal();
                                showCustomModal({
                                    title: "Error",
                                    message: "Playlist name cannot be empty.",
                                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                });
                            }
                        }
                    },
                    { text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }
                ]
            });
        });
    } else { console.error("Create Playlist button not found."); }

    if (viewLikedBtn) {
        viewLikedBtn.addEventListener("click", () => {
            console.log("View Liked button clicked.");
            // Keep the current right panel content visible, just update the left list
            renderLikedSongs();
        });
    } else { console.error("View Liked button not found."); }


    if (viewRecentBtn) {
        viewRecentBtn.addEventListener("click", () => {
            console.log("View Recent button clicked.");
            // Keep the current right panel content visible, just update the left list
            renderRecentlyPlayed();
        });
    } else { console.error("View Recent button not found."); }

    // Search functionality
    if (searchButton) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });

        searchButton.addEventListener("click", () => {
            console.log("Search button clicked.");
            displayRightContent('popularSongsSection');
            popularPlaylistsSection.style.display = 'block';

            const searchTerm = searchInput.value.toLowerCase().trim();

            if (searchTerm.length === 0) {
                activateLeftSongList("All Songs (for Search)", songsGlobalCatalog, false);
                return;
            }

            const filteredSongs = songsGlobalCatalog.filter(song =>
                (song.displayName && song.displayName.toLowerCase().includes(searchTerm)) ||
                (song.artist && song.artist.toLowerCase().includes(searchTerm))
            );

            activateLeftSongList(`Search results for "${searchTerm}"`, filteredSongs, false);

            if (filteredSongs.length === 0) {
                if (songListUL) songListUL.innerHTML = `<li class="p-1 text-center">No results found for "${searchTerm}".</li>`;
            }
        });
    } else { console.error("Search button not found."); }


    // Left Sidebar "Back to Playlists" button functionality
    if (backToPlaylistsBtn) {
        backToPlaylistsBtn.addEventListener('click', () => {
            console.log("Left sidebar: Back to Playlists button clicked.");
            navigateToView('userPlaylistsDisplaySection');
        });
    } else { console.error("Back to Playlists button not found."); }

    // Right Header Back/Forward buttons
    if (backBtn) {
        backBtn.addEventListener('click', goBackInHistory);
    } else { console.error("Header Back button not found."); }
    if (forwardBtn) {
        forwardBtn.addEventListener('click', goForwardInHistory);
    } else { console.error("Header Forward button not found."); }

    console.log("main() function finished execution. Check console for further logs.");
}

// Ensure the main function is called when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', main);

// Initial call to check if DOM is already loaded in case script loads late
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    main();
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Load saved theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '🌞';
} else {
    themeToggleBtn.textContent = '🌙';
}

themeToggleBtn.onclick = function () {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggleBtn.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
};

=======
// main.js

console.log('Melody Maker: Core JavaScript Loaded - Starting Initialization...');

// --- Import functions from new feature modules ---
// Ensure these paths are correct relative to main.js
import { addRecentlyPlayed, getRecentlyPlayed } from './recentlyPlayed.js';
import { addLikedSong, removeLikedSong, isSongLiked, getLikedSongs } from './likedSongs.js';
import { createNewPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, getUserPlaylists } from './playlistManager.js';

// --- Global Variables (CRITICAL: Declared at the top level) ---
let currentSong = new Audio(); // HTML Audio element for playback
let isManuallyToggling = false; let songs = []; // Array to hold song objects for the current playlist (for playback controls)
let currFolder = ""; // Stores the path to the current song folder (e.g., "songs/ALL TIME HITS HINDI")
let songsGlobalCatalog = []; // Global catalog for search function
let currentPlayingSong = null; // Stores the full song object that is currently playing

// Navigation history for right panel views (e.g., Popular Songs, Custom Playlists)
let navigationHistory = [];
let historyPointer = -1;


// --- UI Element References (will be initialized in main to ensure DOM is ready) ---
let playButton, previousButton, nextButton, volumeRange, volumeIcon;
let songInfoDisplay, songTimeDisplay, seekbarCircle, seekbar;
let homeLink, searchLink, createPlaylistBtn, viewLikedBtn, viewRecentBtn;
let currentPlaylistTitle, songListUL, songItemsContainer;
let searchInput, searchButton;
let popularSongsSection, popularPlaylistsSection;
let likeSongBtn; // Heart icon for liking songs in the playbar
let userPlaylistsContainer, userPlaylistsDisplaySection; // Containers for custom playlists
let backBtn, forwardBtn;
let backToPlaylistsBtn, backButtonContainer;
let viewPlaylistsBtn;

// Custom modal elements (match HTML IDs)
let customModal, modalTitle, modalMessage, modalInputContainer, modalInput, modalButtons;

// For auth messages if script.js loads after main.js (optional, depends on your auth setup)
let authModal, authMessageDisplay;
let currentSongIndex = -1;


// --- Song Metadata Lookup Table (FOR EXPLICIT OVERRIDES ONLY) ---
// By default, this object is empty. The application will AUTOMATICALLY try to
// parse artist and display name from filenames in "Artist Name - Song Title.mp3" format.
//
// You ONLY need to add an entry here if:
// 1. A song's filename DOES NOT follow the "Artist Name - Song Title.mp3" format,
//    and you still want a specific artist/display name.
// 2. You want to OVERRIDE the artist/display name parsed from the filename.
//
// Example format for an override:
// "songs/FOLDER_NAME/YOUR_FILENAME.mp3": { displayName: "Custom Song Title", artist: "Custom Artist Name" },
const songsMetadata = {
    // Kept Popular Songs here as they are directly referenced by images/cards,
    // and their artist names might not be in the exact filename format.
    "songs/Popular Songs/Ishq Hai/Ishq Hai.mp3": { displayName: "Ishq Hai", artist: "Anurag Saikia" },
    "songs/Popular Songs/Leja/Leja.mp3": { displayName: "Leja", artist: "Lost Stories , JAI DHIR" },
    "songs/Popular Songs/Mera Naam Mary/Mera Naam Mary.mp3": { displayName: "Mera Naam Mary", artist: "Ajay Atul , Chinmayi" },
    "songs/Popular Songs/O Rangrez/O Rangrez.mp3": { displayName: "O Rangrez", artist: "Shankar-Ehsaan-Loy , Shreya Ghoshal" },
    "songs/Popular Songs/Shaky/Shaky.mp3": { displayName: "Shaky", artist: "Sanju Rathod" },
    "songs/Popular Songs/Rang/Rang.mp3": { displayName: "Rang", artist: "Tanishk Bagchi , Satinder Sartaaj" },
    "songs/Popular Songs/Ranu Bombay Ki Ranu/Ranu Bombay Ki Ranu.mp3": { displayName: "Ranu Bombay Ki Ranu", artist: "Ramu Rathod , Prabha" },
    // NO OTHER SONGS ARE ADDED HERE. THEY WILL BE PARSED FROM FILENAMES.
};


/**
 * Hides all main content sections in the right panel.
 */
function hideAllRightContentSections() {
    console.log("Hiding all right content sections.");
    if (popularSongsSection) popularSongsSection.style.display = 'none';
    if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'none';
    if (userPlaylistsDisplaySection) userPlaylistsDisplaySection.style.display = 'none';
}

/**
 * Displays a specific main content section in the right panel.
 * @param {string} sectionId - The ID of the right-panel section to display.
 */
function displayRightContent(sectionId) {
    console.log(`Attempting to display right content section: ${sectionId}`);
    hideAllRightContentSections();
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log(`Section '${sectionId}' displayed.`);
    } else {
        console.error(`ERROR: Target section with ID '${sectionId}' not found in DOM. Check index.html IDs.`);
    }
}


/**
 * Activates and populates the song list in the left sidebar.
 * This function updates the global 'songs' array.
 * @param {string} title - The title to display for the current song list.
 * @param {Array<Object>} songDataArray - The array of song objects to render.
 * @param {boolean} showBackButton - Whether to show the "Back to Playlists" button.
 */
function activateLeftSongList(title, songDataArray, showBackButton = false) {
    console.log(`Activating left song list with title: '${title}', songs count: ${songDataArray.length}`);
    if (currentPlaylistTitle) currentPlaylistTitle.textContent = title;
    if (songItemsContainer) {
        // Ensure the song list UL (songListUL) is visible by setting its parent container
        songItemsContainer.style.display = 'block';
    } else {
        console.error("ERROR: songItemsContainer is null. Cannot activate left song list.");
        return;
    }

    // Set the global 'songs' array to the current data being displayed in the left panel
    songs = songDataArray;
    renderSongList(songListUL, songs, true); // Render the songs to the UI, always show play button in left sidebar

    if (backButtonContainer) {
        backButtonContainer.style.display = showBackButton ? 'block' : 'none';
    } else {
        console.warn("backButtonContainer is null. Cannot show/hide back button.");
    }
}


/**
 * Updates the disabled state of the navigation buttons in the header.
 */
function updateNavigationButtons() {
    if (backBtn) {
        backBtn.disabled = historyPointer <= 0;
        backBtn.style.opacity = historyPointer <= 0 ? 0.5 : 1;
    } else {
        console.warn("backBtn is null. Cannot update navigation buttons.");
    }
    if (forwardBtn) {
        forwardBtn.disabled = historyPointer >= navigationHistory.length - 1;
        forwardBtn.style.opacity = historyPointer >= navigationHistory.length - 1 ? 0.5 : 1;
    } else {
        console.warn("forwardBtn is null. Cannot update navigation buttons.");
    }
}

/**
 * Navigates to a specified main view section, updates history, and refreshes display.
 * This function now specifically handles which RIGHT panel section to show.
 * The left panel is managed by `activateLeftSongList`.
 * @param {string} viewId - The ID of the main content section to display (e.g., 'popularSongsSection', 'userPlaylistsDisplaySection').
 */
async function navigateToView(viewId) {
    console.log(`Navigating to view: ${viewId}`);
    displayRightContent(viewId); // Show the specific right panel section

    // Manage history for RIGHT panel views only
    if (historyPointer === -1 || navigationHistory[historyPointer] !== viewId) {
        navigationHistory.splice(historyPointer + 1); // Clear forward history
        navigationHistory.push(viewId);
        historyPointer = navigationHistory.length - 1;
        console.log("Navigation History updated:", navigationHistory);
    }
    updateNavigationButtons();

    // Now, manage the LEFT sidebar's song list based on the new right panel view
    if (viewId === 'popularSongsSection') {
        // When going to Popular Songs, also show Popular Playlists
        if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block';
        const fetchedSongs = await getSongs("songs/ALL TIME HITS HINDI", "All Time Hits"); // Load default popular songs
        activateLeftSongList("All Time Hits", fetchedSongs, false); // Populate left list from the fetched `songs`
    } else if (viewId === 'userPlaylistsDisplaySection') {
        if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'none'; // Hide popular playlists if viewing custom
        if (popularSongsSection) popularSongsSection.style.display = 'none'; // Hide popular songs if viewing custom
        renderUserPlaylists(); // Render custom playlist cards in the right section
        activateLeftSongList("Select a playlist to view its songs.", [], false); // Clear left list
    }
    // For search, liked, recently played, their respective click handlers will populate the left panel directly.
}

/**
 * Navigates back in the history of main views (right panel).
 */
function goBackInHistory() {
    console.log("Going back in history. Current pointer:", historyPointer);
    if (historyPointer > 0) {
        historyPointer--;
        const previousViewId = navigationHistory[historyPointer];
        console.log("Navigating back to:", previousViewId);

        // Directly display the right panel view
        displayRightContent(previousViewId);

        // Reload default songs for left panel based on the previous view
        if (previousViewId === 'popularSongsSection') {
            if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible
            getSongs("songs/ALL TIME HITS HINDI", "All Time Hits").then(loadedSongs => {
                activateLeftSongList("All Time Hits", loadedSongs, false);
            });
        } else if (previousViewId === 'userPlaylistsDisplaySection') {
            renderUserPlaylists(); // Re-render custom playlists in the right panel
            activateLeftSongList("My Playlists", [], false); // Reset left song list
        } else {
            // Fallback for other states like search if they were in history
            activateLeftSongList("Songs", [], false); // Just clear the list
        }
        updateNavigationButtons();
    } else {
        console.log("Cannot go back further in history.");
    }
}

/**
 * Navigates forward in the history of main views (right panel).
 */
function goForwardInHistory() {
    console.log("Going forward in history. Current pointer:", historyPointer);
    if (historyPointer < navigationHistory.length - 1) {
        historyPointer++;
        const nextViewId = navigationHistory[historyPointer];
        console.log("Navigating forward to:", nextViewId);

        // Directly display the right panel view
        displayRightContent(nextViewId);

        // Reload default songs for left panel based on the next view
        if (nextViewId === 'popularSongsSection') {
            if (popularPlaylistsSection) popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible
            getSongs("songs/ALL TIME HITS HINDI", "All Time Hits").then(loadedSongs => {
                activateLeftSongList("All Time Hits", loadedSongs, false);
            });
        } else if (nextViewId === 'userPlaylistsDisplaySection') {
            renderUserPlaylists(); // Re-render custom playlists in the right panel
            activateLeftSongList("My Playlists", [], false); // Reset left song list
        } else {
            // Fallback for other states like search
            activateLeftSongList("Songs", [], false); // Just clear the list
        }
        updateNavigationButtons();
    } else {
        console.log("Cannot go forward further in history.");
    }
}


/**
 * Parses the filename to extract artist and display name.
 * Assumes format "Artist Name - Song Title.mp3"
 * @param {string} fileName - The original decoded filename (e.g., "Artist Name - Song Title.mp3").
 * @returns {{displayName: string, artist: string}} Object with parsed display name and artist.
 */
function parseSongInfoFromFilename(fileName) {
    const cleanFileName = fileName.replace(/\.mp3$/, '');
    const parts = cleanFileName.split(' - '); // Split by " - " (space-hyphen-space)

    if (parts.length >= 2) {
        // Assume everything before the first " - " is the artist
        const artist = parts[0].trim();
        // Assume everything after the first " - " is the song title
        const displayName = parts.slice(1).join(' - ').trim();
        return { displayName: displayName, artist: artist };
    } else {
        // If " - " not found, use filename as display name and "Unknown Artist"
        return { displayName: cleanFileName, artist: "Unknown Artist" };
    }
}

/**
 * Converts seconds to a formatted MM:SS string.
 * @param {number} seconds - The time in seconds.
 * @returns {string} Formatted time string (e.g., "03:45").
 */
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Displays a custom modal dialog.
 * @param {object} options - Configuration for the modal.
 * @param {string} options.title - The title of the modal.
 * @param {string} options.message - The message content of the modal.
 * @param {Array<object>} options.buttons - An array of button objects.
 * @param {string} options.buttons[].text - The text displayed on the button.
 * @param {string} options.buttons[].class - CSS class for the button (e.g., 'btn-primary', 'btn-danger').
 * @param {function} options.buttons[].onClick - The function to execute when the button is clicked.
 * @param {boolean} [options.showInput=false] - Whether to show an input field in the modal.
 */
function showCustomModal({ title, message, buttons, showInput = false }) {
    console.log(`Showing modal: ${title}`);
    if (!customModal || !modalTitle || !modalMessage || !modalButtons || !modalInputContainer || !modalInput) {
        console.error("ERROR: Custom modal elements not found in DOM (showCustomModal). Check index.html IDs.");
        return;
    }

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modalButtons.innerHTML = '';
    modalInput.value = ''; // Clear input field
    modalInputContainer.style.display = showInput ? 'block' : 'none'; // Show/hide input

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.className = `btn ${button.class}`;
        btn.onclick = button.onClick;
        modalButtons.appendChild(btn);
    });

    customModal.style.display = 'flex'; // Show the modal
    customModal.classList.remove('hidden'); // Ensure it's visible if CSS uses 'hidden' class
    // Add backdrop if it exists
    const modalBackdrop = document.getElementById('customModalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.remove('hidden');
    }
}

/**
 * Hides the custom modal dialog.
 */
function hideCustomModal() {
    console.log("Hiding modal.");
    if (customModal) {
        customModal.style.display = 'none';
        customModal.classList.add('hidden'); // Add 'hidden' class back
    }
    // Also hide backdrop
    const modalBackdrop = document.getElementById('customModalBackdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.add('hidden');
    }
}


/**
 * Fetches songs from a specified folder.
 * This function updates the global `songs` array directly.
 * @param {string} folderPath - The path to the folder containing MP3s (e.g., "songs/ALL TIME HITS HINDI").
 * @param {string} [displayTitle] - Optional title to display in the left sidebar.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of song objects.
 */
async function getSongs(folderPath, displayTitle = null) {
    currFolder = folderPath;
    console.log(`Attempting to fetch directory listing from: /${folderPath}/`);
    try {
        let response = await fetch(`/${folderPath}/`);

        if (!response.ok) {
            console.error(`FETCH ERROR: Failed to fetch directory listing for ${folderPath}. Status: ${response.status} ${response.statusText}.`);
            console.error("Possible reasons: 1. No local web server running. 2. Incorrect folder path. 3. Server doesn't allow directory listing (e.g., Apache/Nginx default configuration). 4. CORS issue.");
            return [];
        }
        let responseText = await response.text();
        console.log(`Successfully fetched directory listing for ${folderPath}. Parsing songs...`);

        let div = document.createElement("div");
        div.innerHTML = responseText;

        let anchors = div.getElementsByTagName("a");
        let newSongs = [];

        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            // Filter for MP3 files and exclude parent directory links
            if (anchor.href.endsWith(".mp3") && !anchor.textContent.includes("Parent Directory")) {
                // Use URL object to correctly parse the pathname and get the last segment
                let rawFileName = new URL(anchor.href).pathname.split('/').pop();
                rawFileName = decodeURIComponent(rawFileName); // Fully decode filename

                const fullSongPathForMetadata = `${folderPath}/${rawFileName}`; // Create full path for lookup

                let songInfo = songsMetadata[fullSongPathForMetadata];

                if (!songInfo) {
                    songInfo = parseSongInfoFromFilename(rawFileName); // Pass decoded filename
                }

                // Check if song already exists in newSongs array to prevent duplicates
                const exists = newSongs.some(s =>
                    s.originalFileName === rawFileName && s.folderPath === folderPath
                );
                if (!exists) {
                    newSongs.push({
                        originalFileName: rawFileName, // Store the decoded filename
                        displayName: songInfo.displayName,
                        artist: songInfo.artist,
                        folderPath: folderPath // Store folder path with song object
                    });
                }
            }
        }
        // IMPORTANT: Directly set the global `songs` array here as this is the source
        // for the current list of playable songs for the playbar controls.
        songs = newSongs;
        console.log(`Loaded ${songs.length} songs into global 'songs' array from ${folderPath}:`, songs);

        return songs; // Return the loaded songs
    } catch (error) {
        console.error("CRITICAL ERROR during getSongs fetch/parsing:", error);
        console.error("This could be a network issue, CORS, or a problem with the URL you're trying to fetch (e.g., server doesn't allow directory listing, or is serving an incorrect format for the directory listing).");
        showCustomModal({
            title: "Loading Error",
            message: `Failed to load songs from '${folderPath}'. Please ensure the folder exists on your server and contains valid MP3 files, and your server allows directory listing.`,
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return [];
    }
}


/**
 * Renders a list of songs into a specified UL element.
 * @param {HTMLElement} ulElement - The <ul> element to populate.
 * @param {Array<Object>} songDataArray - Array of song objects ({originalFileName, displayName, artist, folderPath}).
 * @param {boolean} showPlayButton - Whether to show the play now button beside each song.
 */
function renderSongList(ulElement, songDataArray, showPlayButton = true) {
    console.log(`Rendering song list to UI. Target UL: ${ulElement ? 'Exists' : 'NULL'}, Songs count: ${songDataArray.length}`);
    if (!ulElement) {
        console.error("ERROR: Target UL element (songListUL) is null. Cannot render songs to UI.");
        return;
    }

    ulElement.innerHTML = ""; // Clear current list
    if (songDataArray.length === 0) {
        ulElement.innerHTML = `<li class="p-1 text-center" style="color: #b3b3b3; font-style: italic;">No songs to display.</li>`;
        return;
    }

    songDataArray.forEach(song => {
        const isCurrentlyLiked = isSongLiked(song);
        const heartIconSrc = isCurrentlyLiked ? "img/heart-filled.svg" : "img/heart.svg";
        const heartIconClass = isCurrentlyLiked ? "liked" : "";

        const encodedOriginalFileName = encodeURIComponent(song.originalFileName);
        const encodedFolderPath = encodeURIComponent(song.folderPath);

        ulElement.innerHTML += `<li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div> ${song.displayName}</div>
                <div>${song.artist}</div>
            </div>
            ${showPlayButton ? `
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert play-icon" src="img/play.svg" alt="Play Song">
                <img class="invert song-list-heart-icon ${heartIconClass}" data-original-filename="${encodedOriginalFileName}" data-folder-path="${encodedFolderPath}" src="${heartIconSrc}" alt="Like Song">
                <img class="invert add-to-playlist-icon" src="img/plus.svg" alt="Add to Playlist" title="Add to Playlist" style="width:20px;height:20px;margin-left:6px;cursor:pointer;">
            </div>` : ''}
        </li>`;
    });

    // Attach event listeners for each song item and its icons
    Array.from(ulElement.querySelectorAll("li")).forEach((li, index) => {
        const songForThisListItem = songDataArray[index];
        if (!songForThisListItem) {
            console.error("Could not find song object for list item at index:", index);
            return;
        }

        const heartIcon = li.querySelector('.song-list-heart-icon');
        const playIcon = li.querySelector('.play-icon');
        const addBtn = li.querySelector('.add-to-playlist-icon');

        // Like/unlike
        if (heartIcon) {
            heartIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                if (isSongLiked(songForThisListItem)) {
                    removeLikedSong(songForThisListItem);
                    heartIcon.classList.remove('liked');
                    heartIcon.src = "img/heart.svg";
                } else {
                    addLikedSong(songForThisListItem);
                    heartIcon.classList.add('liked');
                    heartIcon.src = "img/heart-filled.svg";
                }
                if (currentPlaylistTitle && currentPlaylistTitle.textContent === "Liked Songs") renderLikedSongs();
                if (currentPlayingSong &&
                    currentPlayingSong.originalFileName === songForThisListItem.originalFileName &&
                    currentPlayingSong.folderPath === songForThisListItem.folderPath) {
                    if (isSongLiked(currentPlayingSong)) {
                        likeSongBtn.classList.add('liked');
                        likeSongBtn.src = "img/heart-filled.svg";
                    } else {
                        likeSongBtn.classList.remove('liked');
                        likeSongBtn.src = "img/heart.svg";
                    }
                }
            });
        }

        // Play
        if (playIcon) {
            playIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                playMusic(songForThisListItem);
            });
        }

        // Add to playlist
        if (addBtn) {
            addBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                showAddToPlaylistModal(songForThisListItem);
            });
        }

        // List item click (play)
        li.addEventListener("click", (event) => {
            if (
                event.target.closest('.playnow') ||
                event.target.closest('.song-list-heart-icon') ||
                event.target.closest('.add-to-playlist-icon')
            ) {
                return;
            }
            playMusic(songForThisListItem);
        });
    });
}

function showAddToPlaylistModal(song) {
    const playlists = getUserPlaylists();
    if (playlists.length === 0) {
        showCustomModal({
            title: "No Playlists",
            message: "You have no playlists. Create one first!",
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return;
    }

    // If only one playlist, add directly and show confirmation
    if (playlists.length === 1) {
        const playlist = playlists[0];
        const added = addSongToPlaylist(playlist.id, song);
        showCustomModal({
            title: added ? "Song Added" : "Already Exists",
            message: added
                ? `'${song.displayName}' added to playlist '${playlist.name}'.`
                : `'${song.displayName}' is already in that playlist.`,
            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
        });
        return;
    }

    // For multiple playlists, build the list as HTML
    let playlistOptions = playlists.map(pl =>
        `<li data-playlist-id="${pl.id}" style="padding:10px;cursor:pointer;border-bottom:1px solid #222;">
            ${pl.name} <span style="color:#b3b3b3;font-size:0.9em;">(${pl.songs.length} songs)</span>
        </li>`
    ).join('');
    const playlistListHTML = `<ul style="list-style:none;padding:0;margin:0;">${playlistOptions}</ul>`;

    // Show the modal first
    showCustomModal({
        title: "Add to Playlist",
        message: playlistListHTML,
        buttons: [{ text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }]
    });

    // Attach click listeners AFTER the modal is rendered
    setTimeout(() => {
        document.querySelectorAll('#modalMessage ul li').forEach(li => {
            li.addEventListener('click', () => {
                const playlistId = li.getAttribute('data-playlist-id');
                const added = addSongToPlaylist(playlistId, song);
                hideCustomModal();
                showCustomModal({
                    title: added ? "Song Added" : "Already Exists",
                    message: added
                        ? `'${song.displayName}' added to playlist '${li.textContent.split(' (')[0]}'.`
                        : `'${song.displayName}' is already in that playlist.`,
                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                });
            });
        });
    }, 0); // Ensures DOM is updated before attaching listeners
}




/**
 * Plays a given track.
 * @param {object} songObj - The song object to play ({originalFileName, displayName, artist, folderPath}).
 * @param {boolean} [pause=false] - If true, loads the song but keeps it paused.
 */
const playMusic = (songObj, pause = false) => {
    console.log(`Attempting to play music: ${songObj ? songObj.displayName : 'Invalid Song Object'}`);
    if (!songObj || !songObj.folderPath || !songObj.originalFileName) {
        console.error("ERROR: Invalid song object provided to playMusic. Missing folderPath or originalFileName:", songObj);
        if (songInfoDisplay) songInfoDisplay.innerHTML = "Error: Invalid Song";
        currentSong.pause();
        if (playButton) playButton.src = "img/play.svg";
        currentPlayingSong = null; // Ensure currentPlayingSong is cleared on error
        return;
    }

    currFolder = songObj.folderPath;

    // Construct the full URL to the MP3 file.
    // Both folderPath and originalFileName should be correctly URL-encoded.
    const encodedFolderPath = encodeURIComponent(songObj.folderPath).replace(/%2F/g, '/'); // Ensure slashes stay as slashes
    const encodedFileName = encodeURIComponent(songObj.originalFileName);

    const fullAudioSrc = `/${encodedFolderPath}/${encodedFileName}`;
    currentSong.src = fullAudioSrc;
    console.log("Setting Audio src to:", currentSong.src);
    currentPlayingSong = songObj;

    currentSongIndex = songs.findIndex(s =>
        s.originalFileName === songObj.originalFileName &&
        s.folderPath === songObj.folderPath
    );

    // Update playbar heart icon based on the liked status of the new current song
    if (likeSongBtn) {
        if (isSongLiked(currentPlayingSong)) {
            likeSongBtn.classList.add('liked');
            likeSongBtn.src = "img/heart-filled.svg";
        } else {
            likeSongBtn.classList.remove('liked');
            likeSongBtn.src = "img/heart.svg";
        }
    } else {
        console.warn("likeSongBtn not found in DOM.");
    }

    if (!pause) {
        currentSong.play()
            .then(() => {
                if (playButton) playButton.src = "img/pause.svg";
                console.log("Song playback initiated successfully for:", songObj.displayName);
                addRecentlyPlayed(songObj); // Add to recently played only on successful playback
            })
            .catch(error => {
                console.error("ERROR playing music:", error);
                let errorMessage = `Could not play '${songObj.displayName}'.`;
                if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
                    console.log("Autoplay blocked, but silently handled.");
                    return; // Exit without showing modal
                } else if (error.name === 'NetworkError' || error.message.includes('404')) {

                } else if (error.name === 'NetworkError' || error.message.includes('404')) {
                    errorMessage += ` File not found or network issue. Please check the song path: "${currentSong.src}" and ensure the file exists on your server.`;
                    console.error(`Network error or song not found (404). Check the song path in Network tab: ${currentSong.src}. Error details:`, error);
                } else if (error.name === 'NotSupportedError') {
                    errorMessage += " Audio format might not be supported or the file is corrupted.";
                    console.error(`NotSupportedError: The audio format might not be supported or the file is corrupted. Source: ${currentSong.src}. Error details:`, error);
                } else {
                    errorMessage += ` Unknown playback error: ${error.message || error.name}`;
                    console.error("Unknown playback error details:", error);
                }

                if (playButton) playButton.src = "img/play.svg";
                currentPlayingSong = null; // Clear current playing song on error
                showCustomModal({ title: "Playback Error", message: errorMessage, buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }] });
            });
    } else {
        if (playButton) playButton.src = "img/play.svg";
        console.log("Song loaded but paused as requested.");
    }

    if (songInfoDisplay) songInfoDisplay.innerHTML = songObj.displayName;
    if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
};


/**
 * Attaches click listeners to all existing playlist/song cards in the HTML.
 */
function setupCardClickListeners() {
    console.log("Setting up click listeners for all existing HTML cards.");

    Array.from(document.querySelectorAll(".spotifySong .card, .spotifyPlaylists .card")).forEach(cardElement => {
        cardElement.addEventListener("click", async () => {
            let folderPathSuffix = cardElement.dataset.folder;
            let displayTitle = cardElement.querySelector('h2') ? cardElement.querySelector('h2').textContent : 'Unknown Playlist';

            if (folderPathSuffix) {
                let fullFolderPath = `songs/${folderPathSuffix}`;
                console.log(`Clicked card. Attempting to fetch songs from: ${fullFolderPath}`);

                const fetchedSongs = await getSongs(fullFolderPath, displayTitle);

                // Only show back button if it's a popular playlist card.
                const showBackButtonForCard = cardElement.closest('#popularPlaylistsSection') ? true : false;

                activateLeftSongList(displayTitle, fetchedSongs, showBackButtonForCard);

                // Autoplay after click, but add a small delay to avoid AbortError on very fast interaction
                if (fetchedSongs.length > 0) {
                    // Attempt to play the first song.
                    // This is still subject to browser autoplay policies.
                    setTimeout(() => {
                        console.log(`Attempting autoplay of first song from card click: ${fetchedSongs[0].displayName}`);
                        playMusic(fetchedSongs[0]);
                    }, 100); // 100ms delay
                } else {
                    console.warn(`No songs found in folder: ${fullFolderPath}. Will not start playback.`);
                    if (songInfoDisplay) songInfoDisplay.innerHTML = "No songs in playlist";
                    if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
                    if (playButton) playButton.src = "img/play.svg";
                    currentPlayingSong = null; // Ensure currentPlayingSong is cleared
                }
            } else {
                console.error("Clicked card is missing 'data-folder' attribute. Cannot load songs for playback.");
            }
        });
    });
}


/**
 * Builds a comprehensive catalog of all songs available for simple client-side search.
 */
async function buildAllSongsCatalog() {
    console.log("Building all songs catalog...");
    const topLevelSongFolders = [
        "songs/ALL TIME HITS HINDI",
        "songs/Telugu Hits",
        "songs/OLD SONGS",
        "songs/Bollywood Dance Music",
        "songs/Bollywood 2000s",
        "songs/Insta Hits",
        "songs/Latest Songs",
        "songs/Bhakti Songs",
        "songs/Cartoon Songs",
        "songs/Patriotic Songs",
    ];

    const popularSongFolders = [
        "songs/Popular Songs/Ishq Hai",
        "songs/Popular Songs/Leja",
        "songs/Popular Songs/Mera Naam Mary",
        "songs/Popular Songs/O Rangrez",
        "songs/Popular Songs/Shaky",
        "songs/Popular Songs/Rang",
        "songs/Popular Songs/Ranu Bombay Ki Ranu",
        "songs/Sooseki",
        "songs/Kurchi Madathapetti",
        "songs/Laal Peeli Akhiyaan",
        "songs/Tauba Tauba",
        "songs/Die With A Smile",
        "songs/Teri Baaton Mein Aisa Uljha Jiya",
        "songs/Banni",
        "songs/Chaudhary",
    ];

    const allFoldersToCatalog = [...topLevelSongFolders, ...popularSongFolders];

    let tempAllSongs = [];

    for (const folder of allFoldersToCatalog) {
        try {
            const response = await fetch(`/${folder}/`);
            if (response.ok) {
                const responseText = await response.text();
                const div = document.createElement("div");
                div.innerHTML = responseText;
                Array.from(div.getElementsByTagName("a")).forEach(anchor => {
                    if (anchor.href.endsWith(".mp3") && !anchor.textContent.includes("Parent Directory")) {
                        let rawFileName = new URL(anchor.href).pathname.split('/').pop();
                        rawFileName = decodeURIComponent(rawFileName); // Decode filename

                        const fullSongPathForMetadata = `${folder}/${rawFileName}`;

                        let songInfo = songsMetadata[fullSongPathForMetadata];

                        if (!songInfo) {
                            songInfo = parseSongInfoFromFilename(rawFileName); // Pass decoded filename
                        }

                        const exists = tempAllSongs.some(s =>
                            s.originalFileName === rawFileName && s.folderPath === folder
                        );
                        if (!exists) {
                            tempAllSongs.push({
                                originalFileName: rawFileName,
                                displayName: songInfo.displayName,
                                artist: songInfo.artist,
                                folderPath: folder
                            });
                        }
                    }
                });
            } else {
                console.warn(`WARNING: Failed to fetch songs from ${folder} for catalog: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn(`ERROR during catalog building for ${folder}:`, error);
        }
    }
    tempAllSongs.sort((a, b) => a.displayName.localeCompare(b.displayName));
    songsGlobalCatalog = tempAllSongs;
    console.log("All songs catalog built:", songsGlobalCatalog.length, "songs.");
}


/**
 * Renders user-created playlists in the specified container.
 */
function renderUserPlaylists() {
    console.log("Attempting to render user playlists.");
    if (!userPlaylistsContainer) {
        console.error("ERROR: userPlaylistsContainer is null. Cannot render user playlists.");
        return;
    }

    userPlaylistsContainer.innerHTML = ''; // Clear existing content

    const playlists = getUserPlaylists();
    console.log("Fetched user playlists for rendering:", playlists.length, playlists);

    if (playlists.length === 0) {
        userPlaylistsContainer.innerHTML = `<p class="text-center-placeholder">No custom playlists created yet. Click 'Create playlist' above!</p>`;
        return;
    }

    const playlistListHTML = playlists.map(playlist => `
        <div class="user-playlist-card" data-playlist-id="${playlist.id}" data-playlist-name="${playlist.name}">
            <div class="playlist-image-placeholder">
            
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="musicGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
      <stop stop-color="#a259f7"/>
      <stop offset="1" stop-color="#fc5c7d"/>
    </linearGradient>
  </defs>
  <rect x="3" y="5" width="18" height="14" rx="3" fill="url(#musicGradient)"/>
  <path d="M7 9h10M7 13h6" stroke="#ffe29f" stroke-width="2" stroke-linecap="round"/>
  <circle cx="9" cy="17" r="1.5" fill="#fc5c7d"/>
  <circle cx="15" cy="17" r="1.5" fill="#fc5c7d"/>
</svg>

            </div>
            <h3>${playlist.name}</h3>
            <p>${playlist.songs.length} songs</p>
            <div class="user-playlist-actions">
                <button class="btn-sm btn-view-playlist">View</button>
                <button class="btn-sm btn-delete-playlist">Delete</button>
                <button class="btn-sm btn-add-song-to-playlist" title="Add current song to this playlist">Add Current</button>
            </div>
            <div class="user-playlist-songs-list" style="display: none;"></div> <!-- Keep this, but it will always be hidden via CSS -->
        </div>
    `).join('');

    userPlaylistsContainer.innerHTML = playlistListHTML;
    console.log("User playlist HTML rendered.");

    // Add event listeners for new playlist cards
    document.querySelectorAll('.user-playlist-card').forEach(card => {
        const playlistId = card.dataset.playlistId;
        const playlistName = card.dataset.playlistName;

        const viewBtn = card.querySelector('.btn-view-playlist');
        if (viewBtn) {
            viewBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`View playlist button clicked for: ${playlistName}. Displaying songs in left sidebar.`);

                const playlist = getUserPlaylists().find(p => p.id === playlistId);
                if (playlist) {
                    activateLeftSongList(playlistName, playlist.songs, true);
                    // No need to set display block on .user-playlist-songs-list or render into it here
                    if (playlist.songs.length > 0) {
                        setTimeout(() => {
                            playMusic(playlist.songs[0]); // Autoplay first song in playlist
                        }, 100);
                    } else {
                        if (songInfoDisplay) songInfoDisplay.innerHTML = "No songs in playlist";
                        if (songTimeDisplay) songTimeDisplay.innerHTML = "00:00 / 00:00";
                        if (playButton) playButton.src = "img/play.svg";
                        currentPlayingSong = null; // Ensure currentPlayingSong is cleared
                    }
                } else {
                    console.error(`Playlist with ID ${playlistId} not found when trying to view.`);
                }
            });
        } else {
            console.warn(`View button not found for playlist card: ${playlistName}`);
        }


        const deleteBtn = card.querySelector('.btn-delete-playlist');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`Delete playlist button clicked for: ${playlistName}`);
                showCustomModal({
                    title: "Confirm Deletion",
                    message: `Are you sure you want to delete playlist '${playlistName}'? This action cannot be undone.`,
                    buttons: [
                        {
                            text: "Delete", class: "btn-danger", onClick: () => {
                                console.log(`Confirmed deletion of playlist with ID: ${playlistId}`);
                                const deleted = deletePlaylist(playlistId); // This is the call to playlistManager's function
                                hideCustomModal(); // Hide the confirmation modal
                                if (deleted) {
                                    renderUserPlaylists(); // Re-render to update the display
                                    showCustomModal({ // Show a new modal for 'Playlist Deleted'
                                        title: "Playlist Deleted",
                                        message: `'${playlistName}' has been deleted.`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                    // If the deleted playlist's songs were in the left sidebar, clear them
                                    if (currentPlaylistTitle && currentPlaylistTitle.textContent === playlistName) {
                                        activateLeftSongList("Select a playlist to view its songs.", [], false);
                                        currentPlayingSong = null; // Clear current playing song if it was from deleted playlist
                                    }
                                } else {
                                    showCustomModal({
                                        title: "Deletion Failed",
                                        message: `Could not delete playlist '${playlistName}'. It might not exist.`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                }
                            }
                        },
                        { text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }
                    ]
                });
            });
        } else {
            console.warn(`Delete button not found for playlist card: ${playlistName}`);
        }


        const addCurrentBtn = card.querySelector('.btn-add-song-to-playlist');
        if (addCurrentBtn) {
            addCurrentBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                console.log(`Add Current Song button clicked for: ${playlistName}`);
                if (currentPlayingSong) {
                    const songToAdd = {
                        originalFileName: currentPlayingSong.originalFileName,
                        displayName: currentPlayingSong.displayName,
                        artist: currentPlayingSong.artist,
                        folderPath: currentPlayingSong.folderPath
                    };
                    const added = addSongToPlaylist(playlistId, songToAdd);
                    renderUserPlaylists(); // Re-render to update song count on the card
                    if (added) {
                        showCustomModal({
                            title: "Song Added",
                            message: `'${currentPlayingSong.displayName}' added to playlist '${playlistName}'.`,
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    } else {
                        showCustomModal({
                            title: "Already Exists",
                            message: `'${currentPlayingSong.displayName}' is already in playlist '${playlistName}'.`,
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    }
                } else {
                    showCustomModal({
                        title: "No Song Playing",
                        message: "No song is currently playing to add to playlist.",
                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                    });
                }
            });
        } else {
            console.warn(`Add Current Song button not found for playlist card: ${playlistName}`);
        }
    });
}


/**
 * Renders the liked songs list into the main songListUL in the left sidebar.
 */
function renderLikedSongs() {
    console.log("Rendering liked songs.");
    const liked = getLikedSongs();
    activateLeftSongList("Liked Songs", liked, false);
}


/**
 * Renders the recently played songs list into the main songListUL in the left sidebar.
 */
function renderRecentlyPlayed() {
    console.log("Rendering recently played songs.");
    const recent = getRecentlyPlayed();
    activateLeftSongList("Recently Played", recent, false);
}


// --- Main Application Logic Entry Point ---
async function main() {
    console.log("main() function started.");

    // --- Initialize UI Element References (ensure DOM is ready) ---
    playButton = document.getElementById("play");
    previousButton = document.getElementById("previous");
    nextButton = document.getElementById("next");
    volumeRange = document.getElementById("volumeControl");
    volumeIcon = document.querySelector(".volume > img");
    songInfoDisplay = document.querySelector(".songinfo");
    songTimeDisplay = document.querySelector(".songtime");
    seekbarCircle = document.querySelector(".circle");
    seekbar = document.querySelector(".seekbar");
    homeLink = document.getElementById("homeLink");
    searchLink = document.getElementById("searchLink");
    createPlaylistBtn = document.getElementById("createPlaylistBtn");
    viewLikedBtn = document.getElementById("viewLikedBtn");
    viewRecentBtn = document.getElementById("viewRecentBtn");
    currentPlaylistTitle = document.getElementById("currentPlaylistTitle");
    songListUL = document.querySelector(".songList .song-items-container ul");
    songItemsContainer = document.getElementById("songItemsContainer"); // Ensure this ID is present in index.html
    searchInput = document.getElementById("searchInput");
    searchButton = document.getElementById("searchButton");
    popularSongsSection = document.getElementById("popularSongsSection"); // Ensure this ID is present in index.html
    popularPlaylistsSection = document.getElementById("popularPlaylistsSection"); // Ensure this ID is present in index.html
    likeSongBtn = document.getElementById("likeSongBtn");
    userPlaylistsContainer = document.getElementById("userPlaylistsContainer");
    userPlaylistsDisplaySection = document.getElementById('userPlaylistsDisplaySection'); // Ensure this ID is present in index.html
    viewPlaylistsBtn = document.getElementById("viewPlaylistsBtn");

    backBtn = document.getElementById("backBtn");
    forwardBtn = document.getElementById("forwardBtn");
    backToPlaylistsBtn = document.getElementById('backToPlaylistsBtn');
    backButtonContainer = document.getElementById('backButtonContainer');

    customModal = document.getElementById('customModal');
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalInputContainer = document.getElementById('modalInputContainer');
    modalInput = document.getElementById('modalInput');
    modalButtons = document.getElementById('modalButtons');

    // Check if essential elements are found
    if (!playButton || !songListUL || !popularSongsSection || !popularPlaylistsSection || !userPlaylistsDisplaySection ||
        !homeLink || !searchLink || !createPlaylistBtn || !viewLikedBtn || !viewRecentBtn || !currentPlaylistTitle ||
        !songItemsContainer || !searchInput || !searchButton || !likeSongBtn || !userPlaylistsContainer ||
        !backBtn || !forwardBtn || !backToPlaylistsBtn || !backButtonContainer ||
        !customModal || !modalTitle || !modalMessage || !modalInputContainer || !modalInput || !modalButtons
    ) {
        console.error("CRITICAL ERROR: One or more essential UI elements not found. Check index.html IDs. Full list of missing elements below:");
        const missing = {
            playButton: playButton, previousButton: previousButton, nextButton: nextButton, volumeRange: volumeRange, volumeIcon: volumeIcon,
            songInfoDisplay: songInfoDisplay, songTimeDisplay: songTimeDisplay, seekbarCircle: seekbarCircle, seekbar: seekbar,
            homeLink: homeLink, searchLink: searchLink, createPlaylistBtn: createPlaylistBtn, viewLikedBtn: viewLikedBtn, viewRecentBtn: viewRecentBtn,
            currentPlaylistTitle: currentPlaylistTitle, songListUL: songListUL, songItemsContainer: songItemsContainer,
            searchInput: searchInput, searchButton: searchButton, popularSongsSection: popularSongsSection, popularPlaylistsSection: popularPlaylistsSection,
            likeSongBtn: likeSongBtn, userPlaylistsContainer: userPlaylistsContainer, userPlaylistsDisplaySection: userPlaylistsDisplaySection,
            backBtn: backBtn, forwardBtn: forwardBtn, backToPlaylistsBtn: backToPlaylistsBtn, backButtonContainer: backButtonContainer,
            customModal: customModal, modalTitle: modalTitle, modalMessage: modalMessage, modalInputContainer: modalInputContainer, modalInput: modalInput, modalButtons: modalButtons
        };
        for (const key in missing) {
            if (!missing[key]) {
                console.error(`- Missing: ${key}`);
            }
        }

        return; // Stop execution if core elements are missing
    }

    if (viewPlaylistsBtn) {
        viewPlaylistsBtn.addEventListener("click", () => {
            console.log("View Playlists button clicked. Navigating to user playlists section.");
            navigateToView('userPlaylistsDisplaySection');
        });
    } else {
        console.error("View Playlists button not found.");
    }

    // Build the catalog of all songs available for search
    await buildAllSongsCatalog();

    // Initial load: Display popular songs/playlists in the right panel
    displayRightContent('popularSongsSection'); // Show popular songs section initially
    popularPlaylistsSection.style.display = 'block'; // Ensure popular playlists are also visible


    // Initial load: Load default popular songs into the left sidebar
    // DO NOT autoplay on initial page load. User interaction is required for playback.
    console.log("Initial load: Fetching default popular songs for left sidebar (no autoplay on load).");
    const initialSongs = await getSongs("songs/ALL TIME HITS HINDI", "All Time Hits");
    activateLeftSongList("All Time Hits", initialSongs, false); // Populate left list from the fetched 'songs' array

    // Initial history state for right panel
    navigationHistory.push('popularSongsSection'); // Start history with popular songs
    historyPointer = 0;
    updateNavigationButtons();


    // Setup listeners for the playlist cards on the right (so clicking them works)
    setupCardClickListeners();

    // --- Playbar Controls Event Listeners ---
    if (playButton) {
        playButton.addEventListener("click", async () => {
            if (isManuallyToggling) return;
            isManuallyToggling = true;

            try {
                console.log("Play/Pause button clicked.");
                if (currentSong.paused || currentSong.ended) {
                    if (currentPlayingSong) {
                        console.log("Resuming playback of current song.");
                        await currentSong.play();
                        playButton.src = "img/pause.svg";
                    } else if (songs.length > 0) {
                        console.log("No current song, attempting to play first in list.");
                        playMusic(songs[0]);
                    } else {
                        console.warn("Play button clicked, but no song is loaded and current 'songs' array is empty.");
                        showCustomModal({
                            title: "No Song Selected",
                            message: "Please select a song from the list to play.",
                            buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                        });
                    }
                } else {
                    console.log("Pausing playback.");
                    currentSong.pause();
                    playButton.src = "img/play.svg";
                }
            } catch (error) {
                console.error("Playback toggle error:", error);
                playButton.src = "img/play.svg";
            } finally {
                setTimeout(() => { isManuallyToggling = false; }, 300);
            }
        });
    } else {
        console.error("Play button not found.");
    }


    currentSong.addEventListener("timeupdate", () => {
        if (songTimeDisplay && seekbarCircle && !isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            songTimeDisplay.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            seekbarCircle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        } else if (!isFinite(currentSong.duration)) {
            console.warn("Song duration is not finite (likely not loaded fully yet).");
        }
    });

    currentSong.addEventListener("ended", () => {
        console.log("Current song ended.");
        if (songs.length === 0) {
            console.log("Playlist is empty, stopping playback.");
            currentPlayingSong = null;
            if (playButton) playButton.src = "img/play.svg";
            if (songInfoDisplay) songInfoDisplay.innerHTML = "";
            return;
        }

        const currentIndex = songs.findIndex(s =>
            s.originalFileName === currentPlayingSong.originalFileName &&
            s.folderPath === currentPlayingSong.folderPath
        );

        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % songs.length;
            console.log(`Playing next song at index: ${nextIndex}`);
            playMusic(songs[nextIndex]);
        } else {
            console.warn("Current song not found in the list, playing first song if available.");
            if (songs.length > 0) {
                playMusic(songs[0]);
            } else {
                console.warn("Song ended, but no next song found in the current playlist.");
                currentPlayingSong = null;
                if (playButton) playButton.src = "img/play.svg";
                if (songInfoDisplay) songInfoDisplay.innerHTML = "";
            }
        }
    });

    if (seekbar) {
        seekbar.addEventListener("click", e => {
            console.log("Seekbar clicked.");
            if (currentSong.duration && !isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                if (seekbarCircle) seekbarCircle.style.left = percent + "%";
                currentSong.currentTime = ((currentSong.duration) * percent) / 100;
            } else {
                console.warn("Cannot seek: song duration is not available or invalid.");
            }
        });
    } else { console.error("Seekbar not found."); }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (songs.length === 0) return;
            let newIndex = currentSongIndex - 1;
            if (newIndex < 0) newIndex = songs.length - 1;
            playMusic(songs[newIndex]);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            if (songs.length === 0) return;
            let newIndex = currentSongIndex + 1;
            if (newIndex >= songs.length) newIndex = 0;
            playMusic(songs[newIndex]);
        });
    }

    if (volumeRange) {
        volumeRange.addEventListener("input", (e) => {
            currentSong.volume = parseFloat(e.target.value) / 100;
            if (volumeIcon) volumeIcon.src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
        });
    } else { console.error("Volume range not found."); }

    if (volumeIcon) {
        volumeIcon.addEventListener("click", (e) => {
            console.log("Volume icon clicked.");
            if (currentSong.volume === 0) {
                currentSong.volume = 0.10;
                if (volumeRange) volumeRange.value = 10;
                e.target.src = "img/volume.svg";
            } else {
                currentSong.volume = 0;
                if (volumeRange) volumeRange.value = 0;
                e.target.src = "img/mute.svg";
            }
        });
    } else { console.error("Volume icon not found."); }

    // Like Song button functionality (in playbar)
    if (likeSongBtn) {
        likeSongBtn.addEventListener('click', () => {
            console.log("Like song button clicked in playbar.");
            if (currentPlayingSong) {
                if (isSongLiked(currentPlayingSong)) {
                    removeLikedSong(currentPlayingSong);
                    likeSongBtn.classList.remove('liked');
                    likeSongBtn.src = "img/heart.svg"; // Update icon visual
                } else {
                    addLikedSong(currentPlayingSong);
                    likeSongBtn.classList.add('liked');
                    likeSongBtn.src = "img/heart-filled.svg"; // Update icon visual
                }
                // If the liked songs list is currently displayed in the left sidebar, re-render it
                if (currentPlaylistTitle && currentPlaylistTitle.textContent === "Liked Songs") {
                    console.log("Re-rendering Liked Songs list after like/unlike in playbar.");
                    renderLikedSongs();
                }
            } else {
                showCustomModal({
                    title: "No Song Playing",
                    message: "No song is currently playing to like.",
                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                });
            }
        });
    } else { console.error("Like song button not found."); }

    // --- UI Navigation & Action Buttons (using new display logic) ---
    if (homeLink) {
        homeLink.addEventListener("click", async () => {
            console.log("Home link clicked.");
            await navigateToView('popularSongsSection');
        });
    } else { console.error("Home link not found."); }


    if (searchLink) {
        searchLink.addEventListener("click", () => {
            console.log("Search link clicked.");
            displayRightContent('popularSongsSection');
            popularPlaylistsSection.style.display = 'block';

            activateLeftSongList("Search for songs...", [], false);
            if (searchInput) searchInput.focus();

            // No change to history behavior for search as it re-displays popular section
            if (navigationHistory[historyPointer] !== 'popularSongsSection') {
                navigationHistory.splice(historyPointer + 1);
                navigationHistory.push('popularSongsSection');
                historyPointer = navigationHistory.length - 1;
                updateNavigationButtons();
            }
        });
    } else { console.error("Search link not found."); }


    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener("click", () => {
            console.log("Create Playlist button clicked.");
            // 1. First, navigate to the user playlists section
            navigateToView('userPlaylistsDisplaySection');

            // 2. Clear the left song list and hide the back button (this is done by navigateToView's call to activateLeftSongList)
            // 3. Then, open the modal for creating a new playlist
            showCustomModal({
                title: "Create New Playlist",
                message: `Enter a name for your new playlist:`,
                showInput: true,
                buttons: [
                    {
                        text: "Create", class: "btn-primary", onClick: () => {
                            const playlistName = modalInput.value.trim();
                            if (playlistName) {
                                const newPlaylist = createNewPlaylist(playlistName);
                                if (newPlaylist) {
                                    hideCustomModal();
                                    showCustomModal({
                                        title: "Playlist Created",
                                        message: `Playlist '${newPlaylist.name}' created!`,
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                    renderUserPlaylists(); // Re-render user playlists immediately after creation
                                } else {
                                    hideCustomModal();
                                    showCustomModal({
                                        title: "Error",
                                        message: "Failed to create playlist. It might already exist (check console for details).",
                                        buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                    });
                                }
                            } else {
                                hideCustomModal();
                                showCustomModal({
                                    title: "Error",
                                    message: "Playlist name cannot be empty.",
                                    buttons: [{ text: "OK", class: "btn-primary", onClick: hideCustomModal }]
                                });
                            }
                        }
                    },
                    { text: "Cancel", class: "btn-secondary", onClick: hideCustomModal }
                ]
            });
        });
    } else { console.error("Create Playlist button not found."); }

    if (viewLikedBtn) {
        viewLikedBtn.addEventListener("click", () => {
            console.log("View Liked button clicked.");
            // Keep the current right panel content visible, just update the left list
            renderLikedSongs();
        });
    } else { console.error("View Liked button not found."); }


    if (viewRecentBtn) {
        viewRecentBtn.addEventListener("click", () => {
            console.log("View Recent button clicked.");
            // Keep the current right panel content visible, just update the left list
            renderRecentlyPlayed();
        });
    } else { console.error("View Recent button not found."); }

    // Search functionality
    if (searchButton) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });

        searchButton.addEventListener("click", () => {
            console.log("Search button clicked.");
            displayRightContent('popularSongsSection');
            popularPlaylistsSection.style.display = 'block';

            const searchTerm = searchInput.value.toLowerCase().trim();

            if (searchTerm.length === 0) {
                activateLeftSongList("All Songs (for Search)", songsGlobalCatalog, false);
                return;
            }

            const filteredSongs = songsGlobalCatalog.filter(song =>
                (song.displayName && song.displayName.toLowerCase().includes(searchTerm)) ||
                (song.artist && song.artist.toLowerCase().includes(searchTerm))
            );

            activateLeftSongList(`Search results for "${searchTerm}"`, filteredSongs, false);

            if (filteredSongs.length === 0) {
                if (songListUL) songListUL.innerHTML = `<li class="p-1 text-center">No results found for "${searchTerm}".</li>`;
            }
        });
    } else { console.error("Search button not found."); }


    // Left Sidebar "Back to Playlists" button functionality
    if (backToPlaylistsBtn) {
        backToPlaylistsBtn.addEventListener('click', () => {
            console.log("Left sidebar: Back to Playlists button clicked.");
            navigateToView('userPlaylistsDisplaySection');
        });
    } else { console.error("Back to Playlists button not found."); }

    // Right Header Back/Forward buttons
    if (backBtn) {
        backBtn.addEventListener('click', goBackInHistory);
    } else { console.error("Header Back button not found."); }
    if (forwardBtn) {
        forwardBtn.addEventListener('click', goForwardInHistory);
    } else { console.error("Header Forward button not found."); }

    console.log("main() function finished execution. Check console for further logs.");
}

// Ensure the main function is called when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', main);

// Initial call to check if DOM is already loaded in case script loads late
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    main();
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Load saved theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '🌞';
} else {
    themeToggleBtn.textContent = '🌙';
}

themeToggleBtn.onclick = function () {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggleBtn.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
};

>>>>>>> 42daecc (COMMIT ALL FILES TO GITHUB)
