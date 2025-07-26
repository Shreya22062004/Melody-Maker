<<<<<<< HEAD
// js/likedSongs.js
console.log('Melody Maker: Liked Songs Logic Loaded');

let likedSongs = []; // Array to store liked song objects

/**
 * Loads liked songs from localStorage.
 */
function loadLikedSongs() {
    try {
        const stored = localStorage.getItem('likedSongs');
        if (stored) {
            likedSongs = JSON.parse(stored);
            console.log("Loaded liked songs:", likedSongs.length);
        }
    } catch (e) {
        console.error("Error loading liked songs from localStorage:", e);
        likedSongs = []; // Reset if corrupted
    }
}

/**
 * Saves liked songs to localStorage.
 */
function saveLikedSongs() {
    try {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    }
    catch (e) {
        console.error("Error saving liked songs to localStorage:", e);
    }
}

/**
 * Adds a song to the liked songs list.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath}).
 * @returns {boolean} True if added, false if already exists.
 */
export function addLikedSong(song) {
    // Corrected logic: 'some' checks if ANY element satisfies the condition.
    // We want to add if it *doesn't* exist.
    const exists = likedSongs.some(
        s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
    );
    if (!exists) {
        likedSongs.push(song);
        saveLikedSongs();
        console.log("Song liked:", song.displayName);
        return true;
    }
    console.log("Song already liked:", song.displayName);
    return false; // Song was already liked
}

/**
 * Removes a song from the liked songs list.
 * @param {object} song - The song object to remove.
 * @returns {boolean} True if removed, false if not found.
 */
export function removeLikedSong(song) {
    const initialLength = likedSongs.length;
    // Corrected logic: filter keeps elements that satisfy the condition.
    // We want to remove the matching song.
    likedSongs = likedSongs.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    if (likedSongs.length < initialLength) {
        saveLikedSongs();
        console.log("Song unliked:", song.displayName);
        return true;
    }
    console.log("Song not found to unlike:", song.displayName);
    return false; // Song was not found
}

/**
 * Checks if a song is liked.
 * @param {string} originalFileName - The original filename of the song to check.
 * @param {string} folderPath - The folder path of the song to check.
 * @returns {boolean} True if the song is liked, false otherwise.
 */
export function isSongLiked(song) {
  if (!song || !song.originalFileName || !song.folderPath) return false;
  return likedSongs.some(
    s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
  );
}


/**
 * Returns the current list of liked songs.
 * @returns {Array<Object>} The array of liked song objects.
 */
export function getLikedSongs() {
    return [...likedSongs]; // Return a copy
}

// Initialize when script loads
loadLikedSongs();
=======
// js/likedSongs.js
console.log('Melody Maker: Liked Songs Logic Loaded');

let likedSongs = []; // Array to store liked song objects

/**
 * Loads liked songs from localStorage.
 */
function loadLikedSongs() {
    try {
        const stored = localStorage.getItem('likedSongs');
        if (stored) {
            likedSongs = JSON.parse(stored);
            console.log("Loaded liked songs:", likedSongs.length);
        }
    } catch (e) {
        console.error("Error loading liked songs from localStorage:", e);
        likedSongs = []; // Reset if corrupted
    }
}

/**
 * Saves liked songs to localStorage.
 */
function saveLikedSongs() {
    try {
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
    }
    catch (e) {
        console.error("Error saving liked songs to localStorage:", e);
    }
}

/**
 * Adds a song to the liked songs list.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath}).
 * @returns {boolean} True if added, false if already exists.
 */
export function addLikedSong(song) {
    // Corrected logic: 'some' checks if ANY element satisfies the condition.
    // We want to add if it *doesn't* exist.
    const exists = likedSongs.some(
        s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
    );
    if (!exists) {
        likedSongs.push(song);
        saveLikedSongs();
        console.log("Song liked:", song.displayName);
        return true;
    }
    console.log("Song already liked:", song.displayName);
    return false; // Song was already liked
}

/**
 * Removes a song from the liked songs list.
 * @param {object} song - The song object to remove.
 * @returns {boolean} True if removed, false if not found.
 */
export function removeLikedSong(song) {
    const initialLength = likedSongs.length;
    // Corrected logic: filter keeps elements that satisfy the condition.
    // We want to remove the matching song.
    likedSongs = likedSongs.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    if (likedSongs.length < initialLength) {
        saveLikedSongs();
        console.log("Song unliked:", song.displayName);
        return true;
    }
    console.log("Song not found to unlike:", song.displayName);
    return false; // Song was not found
}

/**
 * Checks if a song is liked.
 * @param {string} originalFileName - The original filename of the song to check.
 * @param {string} folderPath - The folder path of the song to check.
 * @returns {boolean} True if the song is liked, false otherwise.
 */
export function isSongLiked(song) {
  if (!song || !song.originalFileName || !song.folderPath) return false;
  return likedSongs.some(
    s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
  );
}


/**
 * Returns the current list of liked songs.
 * @returns {Array<Object>} The array of liked song objects.
 */
export function getLikedSongs() {
    return [...likedSongs]; // Return a copy
}

// Initialize when script loads
loadLikedSongs();
>>>>>>> 42daecc (COMMIT ALL FILES TO GITHUB)
