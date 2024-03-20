const axios = require('axios');

// Define the base URL of your API
const baseURL = 'http://localhost:3000'; // Update this with your actual API URL

// Function to make GET request to /users endpoint
async function getUsers() {
  try {
    const response = await axios.get(`${baseURL}/users`);
    console.log('Users:', response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}