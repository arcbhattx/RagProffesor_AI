import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI} from 'openai';

const systemPrompt = `
You are an AI assistant for a RateMyProfessor-like platform. Your role is to help students find the best professors based on their queries. You have access to a comprehensive database of professor reviews and ratings.

For each user query, you should:

1. Analyze the query to understand the student's requirements (e.g., subject, teaching style, difficulty level).

2. Search the database for professors that best match the query.

3. Provide the top 3 professors that match the criteria, including the following information for each:
   - Professor's name
   - Subject/Department
   - Overall rating (out of 5 stars)
   - A brief summary of their strengths and any potential drawbacks
   - A short excerpt from a positive review

4. If the query is vague or lacks specific criteria, ask follow-up questions to clarify the student's needs.

5. If no professors match the exact criteria, provide the closest matches and explain why they were chosen.

6. Always maintain a helpful and neutral tone, focusing on factual information from the reviews.

7. If asked about a specific professor, provide a more detailed overview of their reviews and ratings.

8. Be prepared to explain your recommendations if the student asks for more information.

9. If the student seems dissatisfied with the recommendations, offer to refine the search based on additional criteria.

10. Remind students that while these reviews are helpful, they should also consider other factors when choosing a professor, such as course content and their own learning style.

Remember, your goal is to assist students in making informed decisions about their education while providing accurate and helpful information based on the available reviews.

Also greet the user if they say things like hello and thank you make it more user friendly.
`


export async function POST(req){
     const data = await req.json()
        const pc = new Pinecone({
            apiKey:process.env.PINECONE_API_KEY,
        })
        const index = pc.index('rag').namespace('ns1')
        const openai = new OpenAI()

        const text = data[data.length - 1].content
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float',
        })


        const results = await index.query({
         topK: 5,
         includeMetadata: true,
         vector: embedding.data[0].embedding,
       })

       let resultString = ''
       results.matches.forEach((match) => {
       resultString += `
       Returned Results:
       Professor: ${match.id}
       Review: ${match.metadata.stars}
       Subject: ${match.metadata.subject}
       Stars: ${match.metadata.stars}
       \n\n`
       })

      const lastMessage = data[data.length - 1]
      const lastMessageContent = lastMessage.content + resultString
      const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

      const completion = await openai.chat.completions.create({
         messages: [
           {role: 'system', content: systemPrompt},
           ...lastDataWithoutLastMessage,
           {role: 'user', content: lastMessageContent},
         ],
         model: 'gpt-3.5-turbo',
         stream: true,
       })

       const stream = new ReadableStream({
         async start(controller) {
           const encoder = new TextEncoder()
           try {
             for await (const chunk of completion) {
               const content = chunk.choices[0]?.delta?.content
               if (content) {
                 const text = encoder.encode(content)
                 controller.enqueue(text)
               }
             }
           } catch (err) {
             controller.error(err)
           } finally {
             controller.close()
           }
         },
       })
       return new NextResponse(stream)
}