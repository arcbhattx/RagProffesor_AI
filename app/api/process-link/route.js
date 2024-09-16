import { NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";
import fetch from 'node-fetch'; // Import node-fetch for server-side fetch
import { OpenAI } from 'openai';

export async function POST(request) {
  try {
    const { link } = await request.json();

    if (!link) {
      return NextResponse.json({ error: 'No link provided' }, { status: 400 });
    }

    // Step 1: Scrape data from Rate My Professor via Python Flask API
    const response = await fetch('http://localhost:5000/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link }),
    });

    if (!response.ok) {
      throw new Error('Failed to scrape professor data.');
    }

    const professorData = await response.json();
    const { professor, subject, stars, review } = professorData;

    // Check for missing review data
    if (!review) {
      throw new Error('No review data found.');
    }

    // Step 2: Generate an embedding using OpenAI API
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: review, // Use the review field from the scraped data
    });

    if (!embeddingResponse || !embeddingResponse.data[0].embedding) {
      throw new Error('Failed to generate embedding.');
    }

    const embedding = embeddingResponse.data[0].embedding;

    // Step 3: Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey:process.env.PINECONE_API_KEY,
  })
    const index = pinecone.Index('rag'); // Replace 'rag' with your Pinecone index name
    const namespace = 'ns1'

    // Step 4: Insert data into Pinecone
    const vector = {
      id: professor, // Unique ID for each professor
      values: embedding, // Embedding vector
      metadata: {
        subject:subject,   // Subject from scraped data
        stars:stars,     // Stars from scraped data
        review:review,    // Review from scraped data
      },
    };


    const upsertResponse = await index.namespace(namespace).upsert([vector])

    return NextResponse.json({ success: true, upsertResponse });
  } catch (error) {
    console.error('Error processing link:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
