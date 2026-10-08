# @sbolel/website

Sinan Bolel's personal website.

## Description

This project is a personal website for Sinan Bolel. The website includes a home page with contact information and a chat feature.

## Requirements

- Node v22
- Yarn
- Java 21 for Firestore emulator-backed rules tests

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

This app uses Cloud Firestore rules only. It does not use Firebase Realtime Database rules.

## Chat data contract

Chat uses Firebase anonymous authentication independently of Cognito. It stores
messages in `chats/{chatId}/messages` with exactly `body` (a nonempty string),
`from` (the authenticated chat owner's UID), and `createdAt` (a server timestamp).
Both the writer and message reader use this schema. Legacy `text` and `sentAt`
fields are not accepted for new writes; existing data is not migrated.

Chat uses the `(default)` Firestore database. Set
`VITE_FIREBASE_FIRESTORE_CHAT='(default)'`; the application also uses `(default)`
when this variable is unset. Keep the application and deployment configuration
aligned with the intended Firebase project and database.

## Manual chat release

Rules are not deployed by CI or semantic release. A frontend release does not
update the production rules. Complete this checklist for every change to the
message contract or its rules:

1. Review the changes and run `yarn ci` and `yarn build`. Confirm the build
   configuration uses the intended Firebase project and `(default)` database.
2. Obtain maintainer approval for production deployments and synthetic test
   messages.
3. In the Firebase Console, verify the signed-in account, project ID,
   `(default)` database, current published rules, and current Hosting version.
   Save credential-free rollback references for the previous rules and Hosting
   release.
4. Inspect the project ID in the `deploy:firestore-rules` script in `package.json`
   before running `yarn deploy:firestore-rules`. The script targets this
   repository's deployment project; update it before deploying a fork. It uses
   `firebase.json` to deploy rules to `(default)`, without deploying Hosting or
   indexes.
5. Open the Firebase Console's Firestore **Rules** tab with `(default)` selected.
   Read back the published source and compare it with the reviewed
   `firestore.rules`; verify the publication time. Allow rules propagation before
   testing new connections.
6. Deploy the tested frontend with
   `yarn exec firebase deploy --config firebase.json --project YOUR_FIREBASE_PROJECT_ID --only hosting`.
   Replace `YOUR_FIREBASE_PROJECT_ID` with the same verified project ID used for
   the rules deployment. Verify the published bundle selects that project and
   `(default)`.
7. After authorization for the smoke test, use a fresh visitor session and send
   two labelled synthetic messages: `Chat smoke test 1 <timestamp>` and
   `Chat smoke test 2 <timestamp>`. Verify the first creates a conversation, the
   second reuses it, both appear after successful writes, and refreshing restores
   both without permission errors. Record only release references, rule hashes,
   timestamps, and test outcomes; do not record tokens or message contents.

If frontend verification fails, restore the previous Hosting version while
retaining rules compatible with the message schema. Restore earlier rules only
if authorization checks regress, and verify that their message schema remains
compatible with the frontend. Keep other databases, indexes, and historical
messages outside the release scope unless the change explicitly requires them.

## Running the Project

1. Start the development server with `yarn start`
2. Build for production with `yarn build`
3. Run all checks with `yarn ci`, including Firestore rules validation through the local Firestore emulator

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
