# Firebase Type Generator

This tool generates TypeScript type definitions based on the structure of a Firebase Firestore collection. It connects to a Firebase project using the Firebase Admin SDK and generates types for the fields in the collection, allowing TypeScript users to work with strongly-typed Firestore data.

## Features

- Generates TypeScript types for Firestore collections.
- Supports nested collections.
- Customizable output folder for type definitions.
- Automatically infers the types of fields based on their values in the Firestore documents.

## Prerequisites

Before using this tool, ensure you have the following:

- Node.js installed.
- Firebase project with Firestore enabled.
- Firebase Admin SDK credentials (a JSON file).

## Usage

`npx typed-firestore <firebase-collection> <firebase-admin-config-path> [options]`

## Options

- `"-o, --output <folder>"`
