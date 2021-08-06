const constants = {
  AVAILABLE_CLASSES_URL: (locationId, brand, startDate, endDate) =>
    `https://marqueoseutreino.solinca.pt/api/location/${locationId}/capacity?brand=${brand}&start=${startDate}&end=${endDate}&duration=60&booking_type=GROUP_CLASS`,
  AVAILABLE_OPEN_AIR_CLASSES_URL: (locationId, brand, startDate, endDate) =>
    `https://reservas.solinca-openair.pt/api/location/${locationId}/capacity?brand=${brand}&start=${startDate}&end=${endDate}&duration=60&booking_type=OUTDOOR`,
  AUTHENTICATION_URL:
    "https://marqueoseutreino.solinca.pt/api/user/authenticate",
  AUTHENTICATION_OPEN_AIR_URL:
    "https://reservas.solinca-openair.pt/api/user/authenticate",
  AUTHENTICATION_ERROR: "Invalid credentials. Authentication failed.",
  AUTHORIZATION_ERROR: "Authorization failed.",
  BCRYPT_SALT_ROUNDS: 12,
  CLASSES_GET_ERROR: "Could not get available classes.",
  CONNECTION_ERROR: (service) => `Unable to connect to ${service} service`,
  EXISTING_USER_ERROR: "The user already exists.",
  GENERAL_ERROR: "An unknown error occurred.",
  GET_CLUBS_URL:
    "https://marqueoseutreino.solinca.pt/api/location?booking_type=GROUP_CLASS",
  GET_OPEN_AIR_CLUBS_URL:
    "https://reservas.solinca-openair.pt/api/location?booking_type=OUTDOOR",
  GET_CLUBS_ERROR: "Could not get available clubs.",
  GET_USER_DATA_ERROR: "Could not fetch user data.",
  INVALID_INPUTS_ERROR: "Invalid inputs. Please check your data.",
  NO_EMAIL_ERROR: "There is no user with this email.",
  NO_PHONE_NUMBER_ERROR: "To subscribe WhatsApp notification, please provide a phone number first.",
  NOTIFICATION_TYPES: ["E-mail", "WhatsApp"],
  RECORD_NOTIFICATION_ERROR: "Could not record notification.",
  RESET_PASSWORD_TOKEN_EXPIRED_ERROR: "Password reset link is invalid or has expired.",
  RESET_PASSWORD_ERROR: "Password reset failed. Please try again.",
  RESTORE_PASSWORD_ERROR: "Password reset failed. Please try again.",
  ROUTE_NOT_FOUND_ERROR: "Route not found",
  SEND_EMAIL_ERROR: (email, error) =>
    `The email to ${email} was not sent - ${error}.`,
  SEND_EMAIL_SUCCESS: (email) => `An email was sent to ${email}.`,
  SEND_PUSH_NOTIFICATION_ERROR: (expoPushToken, error) =>
    `The push notification to ${expoPushToken} was not sent - ${error}.`,
  SEND_PUSH_NOTIFICATION_SUCCESS: (expoPushToken) =>
    `A push notification was sent to ${expoPushToken}.`,
  SEND_WHATSAPP_MESSAGE_ERROR: (phoneNumber, error) =>
    `The WhatsApp message to ${phoneNumber} was not sent - ${error}.`,
  SEND_WHATSAPP_MESSAGE_SUCCESS: (phoneNumber, sid) =>
    `A WhatsApp message was sent to ${phoneNumber} (sid: ${sid}).`,
  SIGNIN_ERROR: "Login failed. Please try again later.",
  SIGNUP_ERROR: "Signing up failed. Please try again later.",
  SOLINCA_AUTH_ERROR: (error) => `Solinca Auth failed - ${error}`,
  TIME_INTERVALS: [180000, 300000, 360000, 415000],
  UPDATE_PASSWORD_ERROR: "The current password is wrong. Please try again.",
  UPDATE_USER_PREFERENCES_ERROR: "The user preferences could not be updated.",
};

module.exports = constants;
