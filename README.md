# @sbolel/website

Sinan Bolel's personal website.

## Description

This project is a personal website for Sinan Bolel. The website includes a home page with contact information and a chat feature.

## Requirements

- Node v20
- Yarn

## Technologies Used

- React
- Material-UI
- Firebase (Firestore)
- TypeScript

## Features

- Responsive design
- Real-time chat functionality
- Integration with Firebase for data storage
- Messages stored in a scalable subcollection structure
- Secure Firestore rules ensuring data privacy

## Setup

1. Clone the repository
2. Install dependencies with `yarn install`
3. Set up a Firebase project and add your configuration to the project
4. Deploy Firestore security rules from `firestore.rules`
5. Create necessary indexes in Firestore for querying messages

## Running the Project

1. Start the development server with `yarn start`
2. Build for production with `yarn build`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
