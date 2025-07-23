// Global variables to store current user data
let currentUser = null;
let currentUserEntitlement = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Handle search type change
    document.getElementById('searchType').addEventListener('change', function() {
        toggleSearchFields();
    });
    
    // Load saved configuration from localStorage
    loadSavedConfig();
});

// Toggle between name and email search fields
function toggleSearchFields() {
    const searchType = document.getElementById('searchType').value;
    const nameFields = document.getElementById('nameFields');
    const emailField = document.getElementById('emailField');
    
    if (searchType === 'name') {
        nameFields.style.display = 'block';
        emailField.style.display = 'none';
    } else {
        nameFields.style.display = 'none';
        emailField.style.display = 'block';
    }
}

// Load saved configuration from localStorage
function loadSavedConfig() {
    const savedOrg = localStorage.getItem('azdo_organization');
    const savedPat = localStorage.getItem('azdo_pat');
    
    if (savedOrg) {
        document.getElementById('organization').value = savedOrg;
    }
    if (savedPat) {
        document.getElementById('pat').value = savedPat;
    }
}

// Save configuration to localStorage
function saveConfig() {
    const organization = document.getElementById('organization').value;
    const pat = document.getElementById('pat').value;
    
    localStorage.setItem('azdo_organization', organization);
    localStorage.setItem('azdo_pat', pat);
}

// Clear all form fields
function clearFields() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    
    // Hide results and error messages
    document.getElementById('results').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    // Reset global variables
    currentUser = null;
    currentUserEntitlement = null;
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide loading indicator
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="success-message">${message}</div>`;
    errorDiv.style.display = 'block';
}

// Validate configuration
function validateConfig() {
    const organization = document.getElementById('organization').value.trim();
    const pat = document.getElementById('pat').value.trim();
    
    if (!organization) {
        showError('Please enter the Azure DevOps organization URL');
        return false;
    }
    
    if (!pat) {
        showError('Please enter your Personal Access Token');
        return false;
    }
    
    // Validate organization URL format
    const orgRegex = /^https:\/\/dev\.azure\.com\/[^\/]+\/?$/;
    if (!orgRegex.test(organization)) {
        showError('Please enter a valid Azure DevOps organization URL (e.g., https://dev.azure.com/yourorg)');
        return false;
    }
    
    return true;
}

// Validate search input
function validateSearchInput() {
    const searchType = document.getElementById('searchType').value;
    
    if (searchType === 'name') {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        
        if (!firstName && !lastName) {
            showError('Please enter at least first name or last name');
            return false;
        }
    } else {
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showError('Please enter an email address');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return false;
        }
    }
    
    return true;
}

// Create authorization header for Azure DevOps API
function getAuthHeader() {
    const pat = document.getElementById('pat').value.trim();
    return 'Basic ' + btoa(':' + pat);
}

// Get organization name from URL
function getOrganizationName() {
    const orgUrl = document.getElementById('organization').value.trim();
    const match = orgUrl.match(/https:\/\/dev\.azure\.com\/([^\/]+)/);
    return match ? match[1] : null;
}

// Search for user in Azure DevOps
async function searchUser() {
    // Validate inputs
    if (!validateConfig() || !validateSearchInput()) {
        return;
    }
    
    // Save configuration
    saveConfig();
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    try {
        const organization = getOrganizationName();
        const authHeader = getAuthHeader();
        
        // Get user entitlements
        const entitlementsUrl = `https://vsaex.dev.azure.com/${organization}/_apis/userentitlements?api-version=7.1-preview.3`;
        
        const response = await fetch(entitlementsUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please check your Personal Access Token.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please ensure your PAT has "User Entitlements (Read & Write)" permissions.');
            } else {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        const users = data.members || [];
        
        // Search for the user
        const searchType = document.getElementById('searchType').value;
        let foundUser = null;
        
        if (searchType === 'name') {
            const firstName = document.getElementById('firstName').value.trim().toLowerCase();
            const lastName = document.getElementById('lastName').value.trim().toLowerCase();
            
            foundUser = users.find(user => {
                const userFirstName = (user.user.displayName.split(' ')[0] || '').toLowerCase();
                const userLastName = (user.user.displayName.split(' ').slice(1).join(' ') || '').toLowerCase();
                const userFullName = user.user.displayName.toLowerCase();
                
                // Check if both first and last name are provided
                if (firstName && lastName) {
                    return (userFirstName.includes(firstName) || userFullName.includes(firstName)) &&
                           (userLastName.includes(lastName) || userFullName.includes(lastName));
                } else if (firstName) {
                    return userFirstName.includes(firstName) || userFullName.includes(firstName);
                } else if (lastName) {
                    return userLastName.includes(lastName) || userFullName.includes(lastName);
                }
                return false;
            });
        } else {
            const email = document.getElementById('email').value.trim().toLowerCase();
            foundUser = users.find(user => 
                user.user.mailAddress && user.user.mailAddress.toLowerCase() === email
            );
        }
        
        if (!foundUser) {
            showError('User not found in the organization.');
            return;
        }
        
        // Store current user data
        currentUser = foundUser.user;
        currentUserEntitlement = foundUser;
        
        // Display user information
        displayUserInfo(foundUser);
        
    } catch (error) {
        console.error('Error searching user:', error);
        showError(error.message || 'An error occurred while searching for the user.');
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Display user information and license details
function displayUserInfo(userEntitlement) {
    const userInfo = document.getElementById('userInfo');
    const licenseInfo = document.getElementById('licenseInfo');
    const actionButtons = document.getElementById('actionButtons');
    const results = document.getElementById('results');
    
    // Display user information
    userInfo.innerHTML = `
        <h3>User Information</h3>
        <p><strong>Name:</strong> ${userEntitlement.user.displayName}</p>
        <p><strong>Email:</strong> ${userEntitlement.user.mailAddress || 'N/A'}</p>
        <p><strong>User ID:</strong> ${userEntitlement.user.id}</p>
        <p><strong>Origin:</strong> ${userEntitlement.user.origin || 'N/A'}</p>
    `;
    
    // Display license information
    const license = userEntitlement.accessLevel;
    const licenseDisplayName = license.licenseDisplayName || license.displayName || 'Unknown';
    const accountLicenseType = license.accountLicenseType || 'Unknown';
    
    licenseInfo.innerHTML = `
        <h3>License Information</h3>
        <p><strong>License Type:</strong> ${licenseDisplayName}</p>
        <p><strong>Account License Type:</strong> ${accountLicenseType}</p>
        <p><strong>Status:</strong> ${license.status || 'Unknown'}</p>
    `;
    
    // Set license info styling based on license type
    licenseInfo.className = 'license-info';
    if (accountLicenseType.toLowerCase().includes('basic')) {
        licenseInfo.classList.add('basic');
    } else if (accountLicenseType.toLowerCase().includes('stakeholder')) {
        licenseInfo.classList.add('stakeholder');
    }
    
    // Display action buttons
    actionButtons.innerHTML = '';
    
    if (accountLicenseType.toLowerCase().includes('basic')) {
        const downgradeBtn = document.createElement('button');
        downgradeBtn.className = 'downgrade-btn';
        downgradeBtn.textContent = 'Downgrade to Stakeholder';
        downgradeBtn.onclick = () => downgradeLicense();
        actionButtons.appendChild(downgradeBtn);
    } else {
        actionButtons.innerHTML = '<p>No actions available for this license type.</p>';
    }
    
    // Show results section
    results.style.display = 'block';
}

// Downgrade user license from Basic to Stakeholder
async function downgradeLicense() {
    if (!currentUserEntitlement) {
        showError('No user selected for license downgrade.');
        return;
    }
    
    const confirmDowngrade = confirm(
        `Are you sure you want to downgrade ${currentUser.displayName}'s license from Basic to Stakeholder?\n\n` +
        'This action will reduce their access permissions in Azure DevOps.'
    );
    
    if (!confirmDowngrade) {
        return;
    }
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    
    try {
        const organization = getOrganizationName();
        const authHeader = getAuthHeader();
        
        // Prepare the patch request to update user entitlement
        const patchUrl = `https://vsaex.dev.azure.com/${organization}/_apis/userentitlements/${currentUserEntitlement.id}?api-version=7.1-preview.3`;
        
        const patchData = {
            from: "",
            op: "replace",
            path: "/accessLevel",
            value: {
                accountLicenseType: "stakeholder",
                licensingSource: "account"
            }
        };
        
        const response = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json-patch+json'
            },
            body: JSON.stringify([patchData])
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication failed. Please check your Personal Access Token.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please ensure your PAT has "User Entitlements (Write)" permissions.');
            } else {
                const errorText = await response.text();
                throw new Error(`License downgrade failed with status ${response.status}: ${errorText}`);
            }
        }
        
        const updatedEntitlement = await response.json();
        
        // Update current user entitlement data
        currentUserEntitlement = updatedEntitlement;
        
        // Show success message
        showSuccess(`Successfully downgraded ${currentUser.displayName}'s license to Stakeholder.`);
        
        // Refresh user information display
        displayUserInfo(updatedEntitlement);
        
    } catch (error) {
        console.error('Error downgrading license:', error);
        showError(error.message || 'An error occurred while downgrading the license.');
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Handle Enter key press in form fields
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        
        // If user is in a search field, trigger search
        if (activeElement.id === 'firstName' || 
            activeElement.id === 'lastName' || 
            activeElement.id === 'email') {
            searchUser();
        }
    }
});