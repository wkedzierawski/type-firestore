import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, CollectionReference } from "firebase-admin/firestore";
import { writeFileSync } from "fs";
import { getType } from "./utils";
import { join } from "path";
import { mkdir } from "fs/promises";
import { program } from "commander";

program
	.argument("<firebase-collection>", "Firebase collection name")
	.argument("<firebase-admin-config-path>", "Firebase admin config file path")
	.option("-o, --output <folder>", "Output folder", ".")
	.parse();

const [collection, firebaseAdminJsonPath] = program.args;
const { output } = program.opts();

if (!collection) {
	throw "Collection not provided!";
}
if (!firebaseAdminJsonPath) {
	throw "Firebase admin credentials path not provided!";
}

const serviceAccount = require(firebaseAdminJsonPath);

initializeApp({
	credential: credential.cert(serviceAccount),
});

type Options = {
	outputDir?: string;
};

const generateTypesFromCollection = async (
	collectionRef: CollectionReference,
	{ outputDir = output }: Options = {}
) => {
	const snapshot = await collectionRef.get();

	if (snapshot.empty) {
		console.log(`Lack of documents in collection: ${collectionRef.path}`);
		return;
	}

	const fieldTypes: Record<string, Set<string>> = {};
	const fieldOccurrences: Record<string, number> = {};
	const totalDocuments = snapshot.size;

	const collectionName = collectionRef.path.split("/").at(-1);
	if (!collectionName) {
		console.log(`Collection name not found: ${collectionRef.path}`);
		return;
	}

	for (const doc of snapshot.docs) {
		const data = doc.data();
		for (const key in data) {
			if (!fieldTypes[key]) {
				fieldTypes[key] = new Set();
				fieldOccurrences[key] = 0;
			}
			fieldTypes[key].add(getType(data[key]));
			fieldOccurrences[key] += 1;
		}

		const subCollectionRefs = await doc.ref.listCollections();

		for (const subcollection of subCollectionRefs) {
			await generateTypesFromCollection(subcollection);
		}
	}

	const firstLetter = collectionName.at(0)?.toUpperCase();
	const typeName = `${firstLetter}${collectionName.slice(1)}`;
	const fileName = `${typeName}.types.ts`;

	const typeDefinition = `
	// ${collectionRef.path}
	export type ${typeName}Type = {
    ${Object.entries(fieldTypes)
			.map(([key, types]) => {
				const typeString = Array.from(types).join(" | ");
				const isOptional = fieldOccurrences[key] < totalDocuments ? "?" : "";
				return `${key}${isOptional}: ${typeString};`;
			})
			.join("\n    ")}
  };`;

	try {
		await mkdir(outputDir, { recursive: true });
		writeFileSync(join(outputDir, fileName), typeDefinition);
		console.log(`Types saved in ${fileName}`);
	} catch (error) {
		console.error(`Failed to save types:`, error);
	}
};

generateTypesFromCollection(getFirestore().collection(collection));
