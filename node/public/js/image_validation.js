// Title: Download an image using Axios and convert it to base64
// Source: https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64

// Download an image using Axios and validate image using image-size.
const axios = require('axios');                                     // Module to store a retrieved URL
const sizeOf = require('image-size');                               // Module to check image dimensions

async function isValidImage(url) {
    try {
  
      // Attempt to get image using Axios and store URL in array. 
      const image = await axios.get(url, { responseType: 'arraybuffer' });
      
      // Use size-of to check the size of the image. 
      const dimensions = sizeOf(image.data);
  
      // If the URL leads to an image with dimensions then return true. 
      if (dimensions.width > 0 && dimensions.height > 0) {
        return true;
      }
      
    // Otherwise, return false (not a valid image).
    } catch (error) {
      return false;
    }
  }

module.exports = {isValidImage};