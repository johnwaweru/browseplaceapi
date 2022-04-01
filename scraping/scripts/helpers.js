const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// export helper functions and variables
module.exports = {
  delay,
};