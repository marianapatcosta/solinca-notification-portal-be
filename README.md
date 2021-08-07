# solinca-notification-portal-be

Considering that there are only a few spots available, it is rare to be able to book online group classes at Solinca’s clubs using the mobile app, at marqueoseutreino.solinca.pt or at reservas.solinca-openair.pt. This portal was developed to allow the user to configure his/her favorite classes for today and tomorrow and to be notified by e-mail or WhatsApp when a spot is available for these classes. This way, there is no need to frequently access Solinca’s app/site to check if some spots emerged for the classes that the user intends to book."
This Backend was developed using Node.JS, Express.JS an MongoDB and communicates with a Frontedn developed with ReactJS [Frontend GitHub Repository](https://github.com/marianapatcosta/solinca-notification-portal-fe). 


## Run "npm i" ou "yarn install" to install the required dependencies
## run "npm run dev" to run de project in dev mode

## The following environnement variable must be configured:
### CLIENT_URL
### DB_USER
### DB_PASSWORD
### DB_NAME
### JWT_KEY
### PORT
### NOTIFIED_CLASSES_TIME_IN_MINUTES
### SENDER_EMAIL
### SENDER_PHONE_NUMBER
### SENDGRID_API_KEY
### TWILIO_ACCOUNT_SID
### TWILIO_AUTH_TOKEN
