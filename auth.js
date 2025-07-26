<<<<<<< HEAD
// auth.js
console.log('Melody Maker: Authentication Script Loaded');

// --- UI Element References ---
let loginButton; // Not directly used, but kept for consistency if needed later
let signupButton; // Not directly used, but kept for consistency if needed later
let headerButtonsContainer; // The div containing signup/login/welcome buttons

// --- Modals and Form Elements ---
let authModal;
let closeAuthModalBtn;
let authModalTitle;
let authForm;
let usernameInput;
let passwordInput;
let authSubmitBtn;
let authMessageDisplay; // For displaying messages like "Login Successful"
let authToggleText;
let switchToSignupLink; // Renamed for clarity
let switchToLoginLink; // Renamed for clarity

// --- Global Variable for current user state (persistent using localStorage for this demo) ---
let currentUser = null; // Stores the username of the logged-in user

let isSignupMode = false; // Tracks whether the modal is in signup or login mode

// --- Utility Functions ---

/**
 * Retrieves all stored user credentials from localStorage.
 * @returns {object} An object containing all usernames as keys and passwords as values.
 */
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('mm_users')) || {};
    } catch (e) {
        console.error("Error parsing 'mm_users' from localStorage:", e);
        return {}; // Return empty object if parsing fails
    }
}

/**
 * Saves user credentials to localStorage (insecure for real apps).
 * @param {string} username
 * @param {string} password
 */
function saveUser(username, password) {
    const users = getUsers(); // Get current users
    users[username] = password; // Store password directly (insecure for a real app)
    localStorage.setItem('mm_users', JSON.stringify(users));
    console.log(`User '${username}' signed up.`);
}

/**
 * Retrieves password for a given username from localStorage.
 * @param {string} username
 * @returns {string|null} Password if found, otherwise null.
 */
function getUserPassword(username) {
    const users = getUsers(); // Get current users
    return users[username] || null;
}

/**
 * Displays a message in the auth modal.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showAuthMessage(message, type) {
    if (authMessageDisplay) {
        authMessageDisplay.textContent = message;
        authMessageDisplay.style.color = type === 'success' ? 'green' : 'red';
        authMessageDisplay.style.display = 'block';
    }
}

/**
 * Hides the message in the auth modal.
 */
function hideAuthMessage() {
    if (authMessageDisplay) {
        authMessageDisplay.style.display = 'none';
    }
}

/**
 * Updates the UI elements based on the current authentication status.
 * This function is responsible for showing/hiding auth modal and main content.
 */
function updateAuthUI() {
    console.log("Updating Auth UI. Current user:", currentUser);
    if (currentUser) {
        // User is logged in
        if (headerButtonsContainer) {
            headerButtonsContainer.innerHTML = `<span class="logged-in-message">Welcome, ${currentUser}!</span><button class="logout-btn btn">Logout</button>`;
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
        // Ensure auth modal is hidden
        if (authModal) authModal.style.display = 'none';
        // Show main app content (assuming it's a flex container or similar)
        const appContainer = document.querySelector('.container');
        if (appContainer) appContainer.style.display = 'flex';

    } else {
        // User is logged out
        if (headerButtonsContainer) {
            headerButtonsContainer.innerHTML = `<button class="signup-btn btn">Sign up</button><button class="login-btn btn">Log in</button>`;
            // Re-attach listeners for newly created buttons (important!)
            const newSignupBtn = document.querySelector('.header .buttons .signup-btn');
            const newLoginBtn = document.querySelector('.header .buttons .login-btn');
            if (newSignupBtn) {
                newSignupBtn.addEventListener('click', () => {
                    if (authModal) authModal.style.display = 'flex';
                    setAuthMode(true); // Switch to signup
                });
            }
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', () => {
                    if (authModal) authModal.style.display = 'flex';
                    setAuthMode(false); // Switch to login
                });
            }
        }
        // Hide main app content until login
        const appContainer = document.querySelector('.container');
        if (appContainer) appContainer.style.display = 'none';
        // Show auth modal
        if (authModal) authModal.style.display = 'flex';
        setAuthMode(false); // Default to login view
    }
}

/**
 * Toggles the authentication modal between Login and Signup mode.
 * Also re-attaches the toggle links dynamically.
 * @param {boolean} signup - True for signup mode, false for login mode.
 */
function setAuthMode(signup) {
    isSignupMode = signup;
    if (authModalTitle) authModalTitle.textContent = signup ? "Signup" : "Login";
    if (authSubmitBtn) authSubmitBtn.textContent = signup ? "Signup" : "Login";
    if (authToggleText) {
        authToggleText.innerHTML = signup
            ? `Already have an account? <a href="#" id="switchToLoginLink">Login</a>`
            : `Don't have an account? <a href="#" id="switchToSignupLink">Signup</a>`;

        // Re-attach listeners after content change
        switchToLoginLink = document.getElementById('switchToLoginLink');
        switchToSignupLink = document.getElementById('switchToSignupLink');

        if (switchToLoginLink) {
            switchToLoginLink.onclick = (e) => {
                e.preventDefault();
                setAuthMode(false); // Switch to login
                hideAuthMessage(); // Clear message on toggle
            };
        }
        if (switchToSignupLink) {
            switchToSignupLink.onclick = (e) => {
                e.preventDefault();
                setAuthMode(true); // Switch to signup
                hideAuthMessage(); // Clear message on toggle
            };
        }
    }
    hideAuthMessage(); // Clear any previous messages
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

/**
 * Handles the login form submission.
 * @param {Event} e - The form submit event.
 */
function handleLogin(e) {
    e.preventDefault(); // Prevent default form submission
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showAuthMessage("Please enter both username and password.", 'error');
        return;
    }

    const storedPassword = getUserPassword(username);

    if (storedPassword && storedPassword === password) {
        showAuthMessage("Login successful!", 'success');
        currentUser = username; // Set global current user
        localStorage.setItem('loggedInUser', username); // Persist login
        setTimeout(() => {
            if (authModal) authModal.style.display = 'none'; // Hide modal after delay
            hideAuthMessage(); // Clear message
            updateAuthUI(); // Update header buttons and show main content
        }, 1200);
    } else {
        showAuthMessage("Invalid username or password.", 'error');
    }
}

/**
 * Handles the signup form submission.
 * @param {Event} e - The form submit event.
 */
function handleSignup(e) {
    e.preventDefault(); // Prevent default form submission
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showAuthMessage("Please enter both username and password.", 'error');
        return;
    }

    const users = getUsers();
    if (users[username]) {
        showAuthMessage("Username already exists. Please choose a different one.", 'error');
        return;
    }

    saveUser(username, password);
    showAuthMessage("Signup successful! Please log in.", 'success');
    // Automatically switch to login form after a short delay
    setTimeout(() => {
        setAuthMode(false); // Switch to login mode
        hideAuthMessage();
    }, 1500);
}

/**
 * Handles user logout.
 */
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('loggedInUser'); // Clear persisted login
    console.log("User logged out.");
    updateAuthUI(); // Update header buttons to show login/signup
}


// --- Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth script DOMContentLoaded');
    // Get references to all necessary UI elements
    authModal = document.getElementById('authModal');
    closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    authModalTitle = document.getElementById('authModalTitle');
    authForm = document.getElementById('authForm');
    usernameInput = document.getElementById('usernameInput');
    passwordInput = document.getElementById('passwordInput');
    authSubmitBtn = document.getElementById('authSubmitBtn');
    authMessageDisplay = document.getElementById('authMessageDisplay');
    authToggleText = document.getElementById('authToggleText');
    headerButtonsContainer = document.querySelector('.header .buttons'); // Assuming this is the div holding login/signup

    // Basic null checks for critical elements
    if (!authModal || !closeAuthModalBtn || !authModalTitle || !authForm || !usernameInput ||
        !passwordInput || !authSubmitBtn || !authMessageDisplay || !authToggleText || !headerButtonsContainer) {
        console.error("CRITICAL ERROR: One or more essential authentication UI elements not found. Auth functionality will be limited.");
        return; // Exit if core elements are missing
    }

    // Attach event listeners
    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
            hideAuthMessage();
        });
    }

    // Close modal if clicking outside
    if (authModal) {
        authModal.addEventListener('click', (event) => {
            if (event.target === authModal) {
                authModal.style.display = 'none';
                hideAuthMessage();
            }
        });
    }

    // THIS IS THE FIX: The form's submit handler now dynamically calls login/signup
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            if (isSignupMode) {
                handleSignup(e);
            } else {
                handleLogin(e);
            }
        });
    }

    // Initial setup of toggle links and UI state
    // These listeners need to be attached first, then updateAuthUI can decide to show the modal.
    const signupBtn = document.querySelector('.header .buttons .signup-btn');
    const loginBtn = document.querySelector('.header .buttons .login-btn');

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'flex';
            setAuthMode(true); // Switch to signup
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'flex';
            setAuthMode(false); // Switch to login
        });
    }


    // Check for existing login on page load and update UI accordingly
    currentUser = localStorage.getItem('loggedInUser');
    updateAuthUI(); // This will either show the modal or the main app
});
=======
// auth.js
console.log('Melody Maker: Authentication Script Loaded');

// --- UI Element References ---
let loginButton; // Not directly used, but kept for consistency if needed later
let signupButton; // Not directly used, but kept for consistency if needed later
let headerButtonsContainer; // The div containing signup/login/welcome buttons

// --- Modals and Form Elements ---
let authModal;
let closeAuthModalBtn;
let authModalTitle;
let authForm;
let usernameInput;
let passwordInput;
let authSubmitBtn;
let authMessageDisplay; // For displaying messages like "Login Successful"
let authToggleText;
let switchToSignupLink; // Renamed for clarity
let switchToLoginLink; // Renamed for clarity

// --- Global Variable for current user state (persistent using localStorage for this demo) ---
let currentUser = null; // Stores the username of the logged-in user

let isSignupMode = false; // Tracks whether the modal is in signup or login mode

// --- Utility Functions ---

/**
 * Retrieves all stored user credentials from localStorage.
 * @returns {object} An object containing all usernames as keys and passwords as values.
 */
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('mm_users')) || {};
    } catch (e) {
        console.error("Error parsing 'mm_users' from localStorage:", e);
        return {}; // Return empty object if parsing fails
    }
}

/**
 * Saves user credentials to localStorage (insecure for real apps).
 * @param {string} username
 * @param {string} password
 */
function saveUser(username, password) {
    const users = getUsers(); // Get current users
    users[username] = password; // Store password directly (insecure for a real app)
    localStorage.setItem('mm_users', JSON.stringify(users));
    console.log(`User '${username}' signed up.`);
}

/**
 * Retrieves password for a given username from localStorage.
 * @param {string} username
 * @returns {string|null} Password if found, otherwise null.
 */
function getUserPassword(username) {
    const users = getUsers(); // Get current users
    return users[username] || null;
}

/**
 * Displays a message in the auth modal.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
function showAuthMessage(message, type) {
    if (authMessageDisplay) {
        authMessageDisplay.textContent = message;
        authMessageDisplay.style.color = type === 'success' ? 'green' : 'red';
        authMessageDisplay.style.display = 'block';
    }
}

/**
 * Hides the message in the auth modal.
 */
function hideAuthMessage() {
    if (authMessageDisplay) {
        authMessageDisplay.style.display = 'none';
    }
}

/**
 * Updates the UI elements based on the current authentication status.
 * This function is responsible for showing/hiding auth modal and main content.
 */
function updateAuthUI() {
    console.log("Updating Auth UI. Current user:", currentUser);
    if (currentUser) {
        // User is logged in
        if (headerButtonsContainer) {
            headerButtonsContainer.innerHTML = `<span class="logged-in-message">Welcome, ${currentUser}!</span><button class="logout-btn btn">Logout</button>`;
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        }
        // Ensure auth modal is hidden
        if (authModal) authModal.style.display = 'none';
        // Show main app content (assuming it's a flex container or similar)
        const appContainer = document.querySelector('.container');
        if (appContainer) appContainer.style.display = 'flex';

    } else {
        // User is logged out
        if (headerButtonsContainer) {
            headerButtonsContainer.innerHTML = `<button class="signup-btn btn">Sign up</button><button class="login-btn btn">Log in</button>`;
            // Re-attach listeners for newly created buttons (important!)
            const newSignupBtn = document.querySelector('.header .buttons .signup-btn');
            const newLoginBtn = document.querySelector('.header .buttons .login-btn');
            if (newSignupBtn) {
                newSignupBtn.addEventListener('click', () => {
                    if (authModal) authModal.style.display = 'flex';
                    setAuthMode(true); // Switch to signup
                });
            }
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', () => {
                    if (authModal) authModal.style.display = 'flex';
                    setAuthMode(false); // Switch to login
                });
            }
        }
        // Hide main app content until login
        const appContainer = document.querySelector('.container');
        if (appContainer) appContainer.style.display = 'none';
        // Show auth modal
        if (authModal) authModal.style.display = 'flex';
        setAuthMode(false); // Default to login view
    }
}

/**
 * Toggles the authentication modal between Login and Signup mode.
 * Also re-attaches the toggle links dynamically.
 * @param {boolean} signup - True for signup mode, false for login mode.
 */
function setAuthMode(signup) {
    isSignupMode = signup;
    if (authModalTitle) authModalTitle.textContent = signup ? "Signup" : "Login";
    if (authSubmitBtn) authSubmitBtn.textContent = signup ? "Signup" : "Login";
    if (authToggleText) {
        authToggleText.innerHTML = signup
            ? `Already have an account? <a href="#" id="switchToLoginLink">Login</a>`
            : `Don't have an account? <a href="#" id="switchToSignupLink">Signup</a>`;

        // Re-attach listeners after content change
        switchToLoginLink = document.getElementById('switchToLoginLink');
        switchToSignupLink = document.getElementById('switchToSignupLink');

        if (switchToLoginLink) {
            switchToLoginLink.onclick = (e) => {
                e.preventDefault();
                setAuthMode(false); // Switch to login
                hideAuthMessage(); // Clear message on toggle
            };
        }
        if (switchToSignupLink) {
            switchToSignupLink.onclick = (e) => {
                e.preventDefault();
                setAuthMode(true); // Switch to signup
                hideAuthMessage(); // Clear message on toggle
            };
        }
    }
    hideAuthMessage(); // Clear any previous messages
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

/**
 * Handles the login form submission.
 * @param {Event} e - The form submit event.
 */
function handleLogin(e) {
    e.preventDefault(); // Prevent default form submission
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showAuthMessage("Please enter both username and password.", 'error');
        return;
    }

    const storedPassword = getUserPassword(username);

    if (storedPassword && storedPassword === password) {
        showAuthMessage("Login successful!", 'success');
        currentUser = username; // Set global current user
        localStorage.setItem('loggedInUser', username); // Persist login
        setTimeout(() => {
            if (authModal) authModal.style.display = 'none'; // Hide modal after delay
            hideAuthMessage(); // Clear message
            updateAuthUI(); // Update header buttons and show main content
        }, 1200);
    } else {
        showAuthMessage("Invalid username or password.", 'error');
    }
}

/**
 * Handles the signup form submission.
 * @param {Event} e - The form submit event.
 */
function handleSignup(e) {
    e.preventDefault(); // Prevent default form submission
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showAuthMessage("Please enter both username and password.", 'error');
        return;
    }

    const users = getUsers();
    if (users[username]) {
        showAuthMessage("Username already exists. Please choose a different one.", 'error');
        return;
    }

    saveUser(username, password);
    showAuthMessage("Signup successful! Please log in.", 'success');
    // Automatically switch to login form after a short delay
    setTimeout(() => {
        setAuthMode(false); // Switch to login mode
        hideAuthMessage();
    }, 1500);
}

/**
 * Handles user logout.
 */
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('loggedInUser'); // Clear persisted login
    console.log("User logged out.");
    updateAuthUI(); // Update header buttons to show login/signup
}


// --- Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth script DOMContentLoaded');
    // Get references to all necessary UI elements
    authModal = document.getElementById('authModal');
    closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    authModalTitle = document.getElementById('authModalTitle');
    authForm = document.getElementById('authForm');
    usernameInput = document.getElementById('usernameInput');
    passwordInput = document.getElementById('passwordInput');
    authSubmitBtn = document.getElementById('authSubmitBtn');
    authMessageDisplay = document.getElementById('authMessageDisplay');
    authToggleText = document.getElementById('authToggleText');
    headerButtonsContainer = document.querySelector('.header .buttons'); // Assuming this is the div holding login/signup

    // Basic null checks for critical elements
    if (!authModal || !closeAuthModalBtn || !authModalTitle || !authForm || !usernameInput ||
        !passwordInput || !authSubmitBtn || !authMessageDisplay || !authToggleText || !headerButtonsContainer) {
        console.error("CRITICAL ERROR: One or more essential authentication UI elements not found. Auth functionality will be limited.");
        return; // Exit if core elements are missing
    }

    // Attach event listeners
    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
            hideAuthMessage();
        });
    }

    // Close modal if clicking outside
    if (authModal) {
        authModal.addEventListener('click', (event) => {
            if (event.target === authModal) {
                authModal.style.display = 'none';
                hideAuthMessage();
            }
        });
    }

    // THIS IS THE FIX: The form's submit handler now dynamically calls login/signup
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            if (isSignupMode) {
                handleSignup(e);
            } else {
                handleLogin(e);
            }
        });
    }

    // Initial setup of toggle links and UI state
    // These listeners need to be attached first, then updateAuthUI can decide to show the modal.
    const signupBtn = document.querySelector('.header .buttons .signup-btn');
    const loginBtn = document.querySelector('.header .buttons .login-btn');

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'flex';
            setAuthMode(true); // Switch to signup
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'flex';
            setAuthMode(false); // Switch to login
        });
    }


    // Check for existing login on page load and update UI accordingly
    currentUser = localStorage.getItem('loggedInUser');
    updateAuthUI(); // This will either show the modal or the main app
});
>>>>>>> 42daecc (COMMIT ALL FILES TO GITHUB)
