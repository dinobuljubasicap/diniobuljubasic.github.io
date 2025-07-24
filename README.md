# Azure DevOps License Manager

A simple web application to check and manage user licenses in Azure DevOps. This tool allows you to search for users by name or email and downgrade Basic licenses to Stakeholder licenses.

## Features

- 🔍 Search users by name (first name, last name, or both)
- 📧 Search users by email address
- 📊 View detailed user and license information
- ⬇️ Downgrade Basic licenses to Stakeholder licenses
- 💾 Save Azure DevOps configuration locally
- 🧹 Clear search fields with one click
- 📱 Responsive design for mobile and desktop

## Prerequisites

Before using this application, you need:

1. **Azure DevOps Organization**: Access to an Azure DevOps organization
2. **Personal Access Token (PAT)**: A PAT with the following permissions:
   - **User Entitlements (Read)**: Required to search and view user licenses
   - **User Entitlements (Write)**: Required to modify user licenses

## Setting Up Your Personal Access Token

1. Go to your Azure DevOps organization (e.g., `https://dev.azure.com/yourorg`)
2. Click on your profile picture in the top right corner
3. Select **Personal access tokens**
4. Click **+ New Token**
5. Configure your token:
   - **Name**: Give it a descriptive name (e.g., "License Manager")
   - **Organization**: Select your organization or "All accessible organizations"
   - **Expiration**: Set an appropriate expiration date
   - **Scopes**: Select **Custom defined** and check:
     - ✅ **User Entitlements (Read)**
     - ✅ **User Entitlements (Write)**
6. Click **Create**
7. **Important**: Copy the token immediately as it won't be shown again

## How to Use

### 1. Configuration

1. Open `index.html` in your web browser
2. In the **Configuration** section:
   - Enter your Azure DevOps organization URL (e.g., `https://dev.azure.com/yourorg`)
   - Enter your Personal Access Token
   - The configuration will be saved locally for future use

### 2. Searching for Users

#### Search by Name:
1. Select "Name" from the search type dropdown
2. Enter the user's first name, last name, or both
3. Click **Search User**

#### Search by Email:
1. Select "Email" from the search type dropdown
2. Enter the user's email address
3. Click **Search User**

### 3. Managing Licenses

Once a user is found:
- View their detailed information (name, email, user ID, origin)
- See their current license type and status
- If the user has a **Basic** license, you'll see a **"Downgrade to Stakeholder"** button
- Click the button to downgrade the license (requires confirmation)

### 4. Clearing Fields

Click the **Clear Fields** button to:
- Clear all search input fields
- Hide search results
- Reset the application state

## License Types

- **Basic**: Full access to Azure DevOps features
- **Stakeholder**: Limited access, suitable for users who need to view and interact with work items but don't need full development features
- **Visual Studio Subscriber**: Includes Azure DevOps benefits based on Visual Studio subscription

## API Information

This application uses the Azure DevOps REST API:
- **User Entitlements API**: `https://vsaex.dev.azure.com/{organization}/_apis/userentitlements`
- **API Version**: 7.1-preview.3
- **Authentication**: Basic authentication using Personal Access Token

## Security Notes

- Your Personal Access Token is stored locally in your browser's localStorage
- The token is only sent to Azure DevOps APIs over HTTPS
- Never share your PAT with others
- Regularly rotate your PATs for security

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check that your PAT is correct and hasn't expired
   - Ensure you copied the entire token without extra spaces

2. **"Access denied"**
   - Verify your PAT has "User Entitlements (Read & Write)" permissions
   - Check that you have admin rights in the Azure DevOps organization

3. **"User not found"**
   - Verify the user exists in your organization
   - Try searching with different name variations
   - For email search, ensure you're using the exact email address

4. **CORS Issues**
   - Some browsers may block cross-origin requests
   - Try using a different browser or serve the files through a local web server

### Serving Locally

If you encounter CORS issues, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then access the application at `http://localhost:8000`

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## License

This project is open source and available under the MIT License.