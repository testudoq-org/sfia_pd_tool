// EndpointHelper.js

const Helper = require('@codeceptjs/helper');

class EndpointHelper extends Helper {

  /**
   * Navigates to the specified endpoint.
   *
   * @param {string} endpointType - The type of endpoint to navigate to.
   * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
   * @throws {Error} Throws an error if the endpointType parameter is falsy.
   */
  async navigateToEndpoint(endpointType) {
    // Check if endpointType is truthy
    if (!endpointType) {
      throw new Error('endpointType parameter is falsy');
    }

    // Log the entry into the function
    console.log(`Entering navigateToEndpoint with endpointType: ${endpointType}`);

    // Get the base URL for the specified endpoint type
    const baseUrl = this._getBaseUrl(endpointType);

    // Check if baseUrl is truthy
    if (!baseUrl) {
      throw new Error('baseUrl is falsy');
    }

    // Log the base URL
    console.log(`baseUrl: ${baseUrl}`);

    // Construct the full endpoint URL
    const endpoint = `${baseUrl}/sfiapdgen.html`;

    // Log the endpoint URL
    console.log(`endpoint: ${endpoint}`);

    // Log the navigation action
    console.log(`Navigating to endpoint: ${endpoint}`);

    // Perform the navigation using the Playwright helper
    try {
      await playwright.page.goto(endpoint);
    } catch (error) {
      throw new Error(`Failed to navigate to endpoint: ${endpoint}, error: ${error.message}`);
    }

    // Log the completion of the navigation
    console.log('Navigation completed');

    // Log the exit from the function
    console.log('Exiting navigateToEndpoint');
  }

  /**
   * Returns the base URL for the specified endpoint type.
   *
   * @param {string} endpointType - The type of endpoint to get the base URL for.
   * @throws {Error} Throws an error if the endpoint type is invalid.
   * @return {string} The base URL for the specified endpoint type.
   */
  _getBaseUrl(endpointType) {
    // Log the entry into the function
    console.log(`Attempting to get base URL for endpoint type: ${endpointType}`);

    // Switch statement to determine the base URL based on the endpoint type
    switch (endpointType) {
      case 'local':
        // Log that the local base URL is being used
        console.log('Using local base URL');

        // Return the local base URL
        return 'http://127.0.0.1:5500/src';
      case 'dist':
        // Log that the dist base URL is being used
        console.log('Using dist base URL');

        // Return the dist base URL
        return 'http://127.0.0.1:5500/dist';
      case 'production':
        // Log that the production base URL is being used
        console.log('Using production base URL');

        // Return the production base URL
        return 'https://testudo.co.nz/sfia';
      default:
        // Log that an invalid endpoint type was provided
        console.log(`Invalid endpoint type: ${endpointType}`);

        // Throw an error with a descriptive message
        throw new Error(`Invalid endpoint type: ${endpointType}`);
    }
  }
}

module.exports = EndpointHelper;
