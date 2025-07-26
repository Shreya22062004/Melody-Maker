<<<<<<< HEAD
// js/recentlyPlayed.js
console.log('Melody Maker: Recently Played Logic Loaded');

let recentlyPlayed = []; // Array to store recently played song objects
const MAX_RECENT_SONGS = 20; // Define max songs here

/**
 * Loads recently played songs from localStorage.
 */
function loadRecentlyPlayed() {
    try {
        const stored = localStorage.getItem('recentlyPlayed');
        if (stored) {
            recentlyPlayed = JSON.parse(stored);
            console.log("Loaded recently played songs:", recentlyPlayed.length);
        }
    } catch (e) {
        console.error("Error loading recently played from localStorage:", e);
        recentlyPlayed = []; // Reset if corrupted
    }
}

/**
 * Saves recently played songs to localStorage.
 */
function saveRecentlyPlayed() {
    try {
        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    } catch (e) {
        console.error("Error saving recently played to localStorage:", e);
    }
}

/**
 * Adds a song to the recently played list.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath, coverImage}).
 */
export function addRecentlyPlayed(song) {
    if (!song || !song.originalFileName || !song.folderPath) {
        console.error("Invalid song object for recently played. Missing originalFileName or folderPath.", song);
        return;
    }

    // Filter out the song if it already exists to move it to the top
    recentlyPlayed = recentlyPlayed.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    // Add the new song to the beginning
    recentlyPlayed.unshift(song);
    // Limit the list size
    if (recentlyPlayed.length > MAX_RECENT_SONGS) {
        recentlyPlayed = recentlyPlayed.slice(0, MAX_RECENT_SONGS);
    }
    saveRecentlyPlayed();
    console.log("Song added to recently played:", song.displayName);
}

/**
 * Returns the current list of recently played songs.
 * @returns {Array<Object>} The array of recently played song objects.
 */
export function getRecentlyPlayed() {
    return [...recentlyPlayed]; // Return a copy to prevent external modification
}

// Initialize when script loads
=======
// js/recentlyPlayed.js
console.log('Melody Maker: Recently Played Logic Loaded');

let recentlyPlayed = []; // Array to store recently played song objects
const MAX_RECENT_SONGS = 20; // Define max songs here

/**
 * Loads recently played songs from localStorage.
 */
function loadRecentlyPlayed() {
    try {
        const stored = localStorage.getItem('recentlyPlayed');
        if (stored) {
            recentlyPlayed = JSON.parse(stored);
            console.log("Loaded recently played songs:", recentlyPlayed.length);
        }
    } catch (e) {
        console.error("Error loading recently played from localStorage:", e);
        recentlyPlayed = []; // Reset if corrupted
    }
}

/**
 * Saves recently played songs to localStorage.
 */
function saveRecentlyPlayed() {
    try {
        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    } catch (e) {
        console.error("Error saving recently played to localStorage:", e);
    }
}

/**
 * Adds a song to the recently played list.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath, coverImage}).
 */
export function addRecentlyPlayed(song) {
    if (!song || !song.originalFileName || !song.folderPath) {
        console.error("Invalid song object for recently played. Missing originalFileName or folderPath.", song);
        return;
    }

    // Filter out the song if it already exists to move it to the top
    recentlyPlayed = recentlyPlayed.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    // Add the new song to the beginning
    recentlyPlayed.unshift(song);
    // Limit the list size
    if (recentlyPlayed.length > MAX_RECENT_SONGS) {
        recentlyPlayed = recentlyPlayed.slice(0, MAX_RECENT_SONGS);
    }
    saveRecentlyPlayed();
    console.log("Song added to recently played:", song.displayName);
}

/**
 * Returns the current list of recently played songs.
 * @returns {Array<Object>} The array of recently played song objects.
 */
export function getRecentlyPlayed() {
    return [...recentlyPlayed]; // Return a copy to prevent external modification
}

// Initialize when script loads
>>>>>>> 42daecc (COMMIT ALL FILES TO GITHUB)
loadRecentlyPlayed();