<<<<<<< HEAD
// playlistManager.js
console.log('Melody Maker: Playlist Manager Logic Loaded');

// Structure for a playlist: { id: string, name: string, songs: Array<Object> }
let userPlaylists = []; // Array to store user-created playlists

/**
 * Loads user playlists from localStorage.
 */
function loadUserPlaylists() {
    try {
        const stored = localStorage.getItem('userPlaylists');
        if (stored) {
            userPlaylists = JSON.parse(stored);
            console.log("Loaded user playlists:", userPlaylists.length);
        }
    } catch (e) {
        console.error("Error loading user playlists from localStorage:", e);
        userPlaylists = []; // Reset if corrupted
    }
}

/**
 * Saves user playlists to localStorage.
 */
function saveUserPlaylists() {
    try {
        localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
        console.log("User playlists saved. Current state:", userPlaylists); // Added log
    } catch (e) {
        console.error("Error saving user playlists to localStorage:", e);
    }
}

/**
 * Creates a new empty playlist.
 * @param {string} playlistName - The name of the new playlist.
 * @returns {object|null} The new playlist object if created, null if name already exists.
 */
export function createNewPlaylist(playlistName) {
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
        console.warn("Playlist name cannot be empty.");
        return null;
    }
    const exists = userPlaylists.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
        console.warn(`Playlist with name '${trimmedName}' already exists.`);
        return null;
    }
    const newPlaylist = {
        id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        name: trimmedName,
        songs: []
    };
    userPlaylists.push(newPlaylist);
    saveUserPlaylists();
    console.log("New playlist created:", newPlaylist.name);
    return newPlaylist;
}

/**
 * Adds a song to a specific playlist.
 * @param {string} playlistId - The ID of the playlist to add the song to.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath}).
 * @returns {boolean} True if song added, false otherwise (playlist not found or song already exists).
 */
export function addSongToPlaylist(playlistId, song) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
        console.warn(`Playlist with ID '${playlistId}' not found.`);
        return false;
    }
    const songExists = playlist.songs.some(
        s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
    );
    if (!songExists) {
        playlist.songs.push(song);
        saveUserPlaylists();
        console.log(`Added '${song.displayName}' to playlist '${playlist.name}'. Current playlist songs:`, playlist.songs.length); // Added log
        return true;
    }
    console.warn(`Song '${song.displayName}' already exists in playlist '${playlist.name}'.`);
    return false;
}

/**
 * Removes a song from a specific playlist.
 * @param {string} playlistId - The ID of the playlist to remove the song from.
 * @param {object} song - The song object to remove.
 * @returns {boolean} True if song removed, false otherwise.
 */
export function removeSongFromPlaylist(playlistId, song) {
    const playlist = userPlaylists.find(p => p.id === playlistId); // Find the playlist first
    if (!playlist) {
        console.warn(`Playlist with ID '${playlistId}' not found for song removal.`);
        return false;
    }

    const initialLength = playlist.songs.length;
    playlist.songs = playlist.songs.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    if (playlist.songs.length < initialLength) {
        saveUserPlaylists();
        console.log(`Removed '${song.displayName}' from playlist '${playlist.name}'. Current playlist songs:`, playlist.songs.length); // Added log
        return true;
    }
    console.warn(`Song '${song.displayName}' not found in playlist '${playlist.name}'.`);
    return false;
}

/**
 * Deletes a playlist by its ID.
 * @param {string} playlistId - The ID of the playlist to delete.
 * @returns {boolean} True if deleted, false if not found.
 */
export function deletePlaylist(playlistId) {
    console.log(`Attempting to delete playlist with ID: ${playlistId}. Initial userPlaylists count: ${userPlaylists.length}`); // Added log
    const initialLength = userPlaylists.length;
    userPlaylists = userPlaylists.filter(p => p.id !== playlistId);
    if (userPlaylists.length < initialLength) {
        saveUserPlaylists();
        console.log(`Playlist with ID '${playlistId}' deleted successfully. New userPlaylists count: ${userPlaylists.length}`); // Added log
        return true;
    }
    console.warn(`Playlist with ID '${playlistId}' not found for deletion.`);
    return false;
}

/**
 * Returns all user-created playlists.
 * @returns {Array<object>} A copy of the userPlaylists array.
 */
export function getUserPlaylists() {
    return [...userPlaylists]; // Return a copy
}

// Initialize when script loads
loadUserPlaylists();


=======
// playlistManager.js
console.log('Melody Maker: Playlist Manager Logic Loaded');

// Structure for a playlist: { id: string, name: string, songs: Array<Object> }
let userPlaylists = []; // Array to store user-created playlists

/**
 * Loads user playlists from localStorage.
 */
function loadUserPlaylists() {
    try {
        const stored = localStorage.getItem('userPlaylists');
        if (stored) {
            userPlaylists = JSON.parse(stored);
            console.log("Loaded user playlists:", userPlaylists.length);
        }
    } catch (e) {
        console.error("Error loading user playlists from localStorage:", e);
        userPlaylists = []; // Reset if corrupted
    }
}

/**
 * Saves user playlists to localStorage.
 */
function saveUserPlaylists() {
    try {
        localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
        console.log("User playlists saved. Current state:", userPlaylists); // Added log
    } catch (e) {
        console.error("Error saving user playlists to localStorage:", e);
    }
}

/**
 * Creates a new empty playlist.
 * @param {string} playlistName - The name of the new playlist.
 * @returns {object|null} The new playlist object if created, null if name already exists.
 */
export function createNewPlaylist(playlistName) {
    const trimmedName = playlistName.trim();
    if (!trimmedName) {
        console.warn("Playlist name cannot be empty.");
        return null;
    }
    const exists = userPlaylists.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
        console.warn(`Playlist with name '${trimmedName}' already exists.`);
        return null;
    }
    const newPlaylist = {
        id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        name: trimmedName,
        songs: []
    };
    userPlaylists.push(newPlaylist);
    saveUserPlaylists();
    console.log("New playlist created:", newPlaylist.name);
    return newPlaylist;
}

/**
 * Adds a song to a specific playlist.
 * @param {string} playlistId - The ID of the playlist to add the song to.
 * @param {object} song - The song object to add ({originalFileName, displayName, artist, folderPath}).
 * @returns {boolean} True if song added, false otherwise (playlist not found or song already exists).
 */
export function addSongToPlaylist(playlistId, song) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
        console.warn(`Playlist with ID '${playlistId}' not found.`);
        return false;
    }
    const songExists = playlist.songs.some(
        s => s.originalFileName === song.originalFileName && s.folderPath === song.folderPath
    );
    if (!songExists) {
        playlist.songs.push(song);
        saveUserPlaylists();
        console.log(`Added '${song.displayName}' to playlist '${playlist.name}'. Current playlist songs:`, playlist.songs.length); // Added log
        return true;
    }
    console.warn(`Song '${song.displayName}' already exists in playlist '${playlist.name}'.`);
    return false;
}

/**
 * Removes a song from a specific playlist.
 * @param {string} playlistId - The ID of the playlist to remove the song from.
 * @param {object} song - The song object to remove.
 * @returns {boolean} True if song removed, false otherwise.
 */
export function removeSongFromPlaylist(playlistId, song) {
    const playlist = userPlaylists.find(p => p.id === playlistId); // Find the playlist first
    if (!playlist) {
        console.warn(`Playlist with ID '${playlistId}' not found for song removal.`);
        return false;
    }

    const initialLength = playlist.songs.length;
    playlist.songs = playlist.songs.filter(
        s => !(s.originalFileName === song.originalFileName && s.folderPath === song.folderPath)
    );
    if (playlist.songs.length < initialLength) {
        saveUserPlaylists();
        console.log(`Removed '${song.displayName}' from playlist '${playlist.name}'. Current playlist songs:`, playlist.songs.length); // Added log
        return true;
    }
    console.warn(`Song '${song.displayName}' not found in playlist '${playlist.name}'.`);
    return false;
}

/**
 * Deletes a playlist by its ID.
 * @param {string} playlistId - The ID of the playlist to delete.
 * @returns {boolean} True if deleted, false if not found.
 */
export function deletePlaylist(playlistId) {
    console.log(`Attempting to delete playlist with ID: ${playlistId}. Initial userPlaylists count: ${userPlaylists.length}`); // Added log
    const initialLength = userPlaylists.length;
    userPlaylists = userPlaylists.filter(p => p.id !== playlistId);
    if (userPlaylists.length < initialLength) {
        saveUserPlaylists();
        console.log(`Playlist with ID '${playlistId}' deleted successfully. New userPlaylists count: ${userPlaylists.length}`); // Added log
        return true;
    }
    console.warn(`Playlist with ID '${playlistId}' not found for deletion.`);
    return false;
}

/**
 * Returns all user-created playlists.
 * @returns {Array<object>} A copy of the userPlaylists array.
 */
export function getUserPlaylists() {
    return [...userPlaylists]; // Return a copy
}

// Initialize when script loads
loadUserPlaylists();


>>>>>>> 42daecc (COMMIT ALL FILES TO GITHUB)
