// Validation utility functions

/**
 * Validates username: digits + characters, symbols only . and _
 * @param {string} username - The username to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { isValid: false, error: "Username is required" };
  }
  
  // Username can have digits, characters, and only . and _ symbols
  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      error: "Username can only contain letters, numbers, dots (.), and underscores (_)" 
    };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters long" };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: "Username must be less than 30 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates password: all characters allowed
 * @param {string} password - The password to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  
  if (password.length > 100) {
    return { isValid: false, error: "Password must be less than 100 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates email format: abc@xyz.com or abc.xyz.st.com
 * @param {string} email - The email to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }
  
  // Standard email format: local@domain
  // Supports: abc@xyz.com, abc.xyz@st.com, etc.
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address (e.g., abc@xyz.com)" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates contact: only digits with exception of + sign
 * @param {string} contact - The contact number to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateContact = (contact) => {
  if (!contact || contact.trim() === "") {
    return { isValid: false, error: "Contact number is required" };
  }
  
  // Contact can start with + and then only digits
  const contactRegex = /^\+?[0-9]+$/;
  
  if (!contactRegex.test(contact)) {
    return { isValid: false, error: "Contact number can only contain digits and a + sign at the beginning" };
  }
  
  if (contact.length < 7) {
    return { isValid: false, error: "Contact number must be at least 7 digits" };
  }
  
  if (contact.length > 15) {
    return { isValid: false, error: "Contact number must be less than 15 digits" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates full name: letters, spaces, and common name characters
 * @param {string} fullName - The full name to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") {
    return { isValid: false, error: "Full name is required" };
  }
  
  // Full name can have letters, spaces, hyphens, and apostrophes
  const fullNameRegex = /^[a-zA-Z\s'-]+$/;
  
  if (!fullNameRegex.test(fullName)) {
    return { isValid: false, error: "Full name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  if (fullName.trim().length < 2) {
    return { isValid: false, error: "Full name must be at least 2 characters long" };
  }
  
  if (fullName.length > 100) {
    return { isValid: false, error: "Full name must be less than 100 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates country: letters, spaces, and common country name characters
 * @param {string} country - The country to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateCountry = (country) => {
  if (!country || country.trim() === "") {
    return { isValid: true, error: "" }; // Country is optional
  }
  
  // Country can have letters, spaces, hyphens, and parentheses
  const countryRegex = /^[a-zA-Z\s'-()]+$/;
  
  if (!countryRegex.test(country)) {
    return { isValid: false, error: "Country name can only contain letters, spaces, hyphens, and parentheses" };
  }
  
  if (country.length > 100) {
    return { isValid: false, error: "Country name must be less than 100 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates city: letters, spaces, and common city name characters
 * @param {string} city - The city to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateCity = (city) => {
  if (!city || city.trim() === "") {
    return { isValid: true, error: "" }; // City is optional
  }
  
  // City can have letters, spaces, hyphens, and apostrophes
  const cityRegex = /^[a-zA-Z\s'-]+$/;
  
  if (!cityRegex.test(city)) {
    return { isValid: false, error: "City name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  if (city.length > 100) {
    return { isValid: false, error: "City name must be less than 100 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates tokens: must be a positive number
 * @param {string|number} tokens - The tokens to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateTokens = (tokens) => {
  if (tokens === null || tokens === undefined || tokens === "") {
    return { isValid: false, error: "Token amount is required" };
  }
  
  const numTokens = Number(tokens);
  
  if (isNaN(numTokens)) {
    return { isValid: false, error: "Token amount must be a number" };
  }
  
  if (numTokens <= 0) {
    return { isValid: false, error: "Token amount must be greater than 0" };
  }
  
  if (!Number.isInteger(numTokens)) {
    return { isValid: false, error: "Token amount must be a whole number" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Filters input to only allow valid characters for username
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterUsername = (value) => {
  return value.replace(/[^a-zA-Z0-9._]/g, '');
};

/**
 * Filters input to only allow valid characters for contact
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterContact = (value) => {
  // Allow + only at the beginning, then only digits
  if (value.startsWith('+')) {
    return '+' + value.slice(1).replace(/[^0-9]/g, '');
  }
  return value.replace(/[^0-9]/g, '');
};

/**
 * Filters input to only allow valid characters for full name
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterFullName = (value) => {
  return value.replace(/[^a-zA-Z\s'-]/g, '');
};

/**
 * Filters input to only allow valid characters for country
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterCountry = (value) => {
  return value.replace(/[^a-zA-Z\s'-()]/g, '');
};

/**
 * Filters input to only allow valid characters for city
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterCity = (value) => {
  return value.replace(/[^a-zA-Z\s'-]/g, '');
};

/**
 * Validates cardholder name: letters, spaces, hyphens, and apostrophes only
 * @param {string} cardholderName - The cardholder name to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateCardholderName = (cardholderName) => {
  if (!cardholderName || cardholderName.trim() === "") {
    return { isValid: false, error: "Cardholder name is required" };
  }
  
  // Cardholder name can have letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  
  if (!nameRegex.test(cardholderName)) {
    return { isValid: false, error: "Cardholder name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  if (cardholderName.trim().length < 2) {
    return { isValid: false, error: "Cardholder name must be at least 2 characters long" };
  }
  
  if (cardholderName.length > 50) {
    return { isValid: false, error: "Cardholder name must be less than 50 characters" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates card number using Luhn algorithm and length check
 * @param {string} cardNumber - The card number to validate (with or without spaces)
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.trim() === "") {
    return { isValid: false, error: "Card number is required" };
  }
  
  // Remove spaces and check if all digits
  const digitsOnly = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: "Card number must contain only digits" };
  }
  
  // Check length (13-19 digits)
  if (digitsOnly.length < 13 || digitsOnly.length > 19) {
    return { isValid: false, error: "Card number must be between 13 and 19 digits" };
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { isValid: false, error: "Invalid card number (Luhn algorithm check failed)" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates expiration date format and checks if it's not in the past
 * @param {string} expirationDate - The expiration date in MM/YY format
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateExpirationDate = (expirationDate) => {
  if (!expirationDate || expirationDate.trim() === "") {
    return { isValid: false, error: "Expiration date is required" };
  }
  
  // Check format MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
    return { isValid: false, error: "Expiration date must be in MM/YY format" };
  }
  
  const [month, year] = expirationDate.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Validate month (01-12)
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: "Month must be between 01 and 12" };
  }
  
  // Convert YY to full year (assuming 2000-2099)
  const fullYear = 2000 + yearNum;
  
  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  
  // Check if expiration date is in the past
  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    return { isValid: false, error: "Expiration date cannot be in the past" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Validates CVV (3-4 digits)
 * @param {string} cvv - The CVV to validate
 * @returns {{isValid: boolean, error: string}} - Validation result
 */
export const validateCVV = (cvv) => {
  if (!cvv || cvv.trim() === "") {
    return { isValid: false, error: "CVV is required" };
  }
  
  // CVV must be 3 or 4 digits
  if (!/^\d{3,4}$/.test(cvv)) {
    return { isValid: false, error: "CVV must be 3 or 4 digits" };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Filters input to only allow valid characters for cardholder name
 * @param {string} value - The input value
 * @returns {string} - Filtered value
 */
export const filterCardholderName = (value) => {
  return value.replace(/[^a-zA-Z\s'-]/g, '');
};

