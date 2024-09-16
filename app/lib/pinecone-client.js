// lib/pinecone-client.js
import { Pinecone } from '@pinecone-database/pinecone';


const pinecone = new Pinecone({apiKey:process.env.PINECONE_API_KEY});

async function initPinecone() {
  if (!pinecone.apiKey) {
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY, // Make sure this is set in your environment variables
      environment: process.env.PINECONE_ENVIRONMENT, // Make sure this is set in your environment variables
    });
  }
  return pinecone;
}

export default initPinecone;
