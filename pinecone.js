import "dotenv/config"; // Load environment variables from .env file
import { Pinecone } from "@pinecone-database/pinecone";

const indexName = process.env.PINECONE_INDEX_NAME;

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY, // Read API key from environment variable
});

const createIndex = async () => {
  await pc.createIndex({
    name: indexName,
    dimension: 1024, // Replace with your model dimensions
    metric: "cosine", // Replace with your model metric
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });

  console.log(`Index '${indexName}' created successfully.`);
};

const deleteIndex = async () => {
  await pc.deleteIndex(indexName)
  console.log(`Index '${indexName}' deleted successfully.`);
};

const command = process.argv[2];

if (command === "create") {
  await createIndex();
} else if (command === "delete") {
  await deleteIndex();
} else {
  console.error("Invalid command. Please use 'create' or 'delete'.");
}
