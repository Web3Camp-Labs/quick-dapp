/**
 * Utility functions for local storage management
 */

const STORAGE_KEYS = {
  DAPPS: 'quick_dapp_saved_dapps',
  RECENT_DAPP: 'quick_dapp_recent',
  METHOD_INPUTS: 'quick_dapp_method_inputs',
};

/**
 * Save a dApp configuration to localStorage
 * @param {Object} dappData - The dApp configuration
 * @returns {boolean} - Success status
 */
export const saveDapp = (dappData) => {
  try {
    const savedDapps = getSavedDapps();

    // Create a unique ID based on contract address and network
    const id = `${dappData.appAddress}_${dappData.appNetwork || 'unknown'}`;

    // Add timestamp
    const dappWithMeta = {
      ...dappData,
      id,
      savedAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    // Update or add the dApp
    const existingIndex = savedDapps.findIndex(d => d.id === id);
    if (existingIndex >= 0) {
      savedDapps[existingIndex] = dappWithMeta;
    } else {
      savedDapps.unshift(dappWithMeta); // Add to beginning
    }

    // Keep only the last 50 dApps
    const trimmedDapps = savedDapps.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.DAPPS, JSON.stringify(trimmedDapps));
    setRecentDapp(dappWithMeta);

    return true;
  } catch (error) {
    console.error('Error saving dApp:', error);
    return false;
  }
};

/**
 * Get all saved dApps
 * @returns {Array} - Array of saved dApp configurations
 */
export const getSavedDapps = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAPPS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error getting saved dApps:', error);
    return [];
  }
};

/**
 * Delete a saved dApp
 * @param {string} id - The dApp ID to delete
 * @returns {boolean} - Success status
 */
export const deleteDapp = (id) => {
  try {
    const savedDapps = getSavedDapps();
    const filtered = savedDapps.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DAPPS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting dApp:', error);
    return false;
  }
};

/**
 * Set the most recently accessed dApp
 * @param {Object} dappData - The dApp configuration
 */
export const setRecentDapp = (dappData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_DAPP, JSON.stringify(dappData));
  } catch (error) {
    console.error('Error setting recent dApp:', error);
  }
};

/**
 * Get the most recently accessed dApp
 * @returns {Object|null} - The recent dApp configuration or null
 */
export const getRecentDapp = () => {
  try {
    const recent = localStorage.getItem(STORAGE_KEYS.RECENT_DAPP);
    return recent ? JSON.parse(recent) : null;
  } catch (error) {
    console.error('Error getting recent dApp:', error);
    return null;
  }
};

/**
 * Update last accessed time for a dApp
 * @param {string} id - The dApp ID
 */
export const updateLastAccessed = (id) => {
  try {
    const savedDapps = getSavedDapps();
    const index = savedDapps.findIndex(d => d.id === id);
    if (index >= 0) {
      savedDapps[index].lastAccessedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.DAPPS, JSON.stringify(savedDapps));
    }
  } catch (error) {
    console.error('Error updating last accessed:', error);
  }
};

/**
 * Save method input values for a specific method
 * @param {string} contractAddress - Contract address
 * @param {string} methodName - Method name
 * @param {Array} values - Input values
 */
export const saveMethodInputs = (contractAddress, methodName, values) => {
  try {
    const key = `${contractAddress}_${methodName}`;
    const allInputs = getAllMethodInputs();
    allInputs[key] = {
      values,
      savedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.METHOD_INPUTS, JSON.stringify(allInputs));
  } catch (error) {
    console.error('Error saving method inputs:', error);
  }
};

/**
 * Get saved method input values
 * @param {string} contractAddress - Contract address
 * @param {string} methodName - Method name
 * @returns {Array|null} - Saved input values or null
 */
export const getMethodInputs = (contractAddress, methodName) => {
  try {
    const key = `${contractAddress}_${methodName}`;
    const allInputs = getAllMethodInputs();
    const saved = allInputs[key];

    // Only return if saved within last 30 days
    if (saved && (Date.now() - saved.savedAt) < 30 * 24 * 60 * 60 * 1000) {
      return saved.values;
    }
    return null;
  } catch (error) {
    console.error('Error getting method inputs:', error);
    return null;
  }
};

/**
 * Get all method inputs
 * @returns {Object} - All saved method inputs
 */
export const getAllMethodInputs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.METHOD_INPUTS);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error getting all method inputs:', error);
    return {};
  }
};

/**
 * Clear all saved data
 */
export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Export saved dApps as JSON
 * @returns {string} - JSON string of saved dApps
 */
export const exportDapps = () => {
  const dapps = getSavedDapps();
  return JSON.stringify(dapps, null, 2);
};

/**
 * Import dApps from JSON
 * @param {string} jsonString - JSON string of dApps
 * @returns {boolean} - Success status
 */
export const importDapps = (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected an array');
    }

    const existing = getSavedDapps();
    const merged = [...imported, ...existing];

    // Remove duplicates based on ID
    const unique = merged.filter((dapp, index, self) =>
      index === self.findIndex(d => d.id === dapp.id)
    );

    localStorage.setItem(STORAGE_KEYS.DAPPS, JSON.stringify(unique.slice(0, 50)));
    return true;
  } catch (error) {
    console.error('Error importing dApps:', error);
    return false;
  }
};
