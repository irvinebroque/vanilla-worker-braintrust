import { initLogger, wrapOpenAI, wrapTraced } from "braintrust";
import OpenAI from "openai";

const logger = initLogger({
	projectName: "Cloudflare",
	apiKey: env.BRAINTRUST_API_KEY,
});

const client = wrapOpenAI(
	new OpenAI({ apiKey: env.OPENAI_API_KEY })
  );

const fetchCompletion = wrapTraced(
	async (input: string): Promise<string> => {
		const stream = await client.chat.completions.create({
			model: 'gpt-4o-2024-11-20',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{ role: 'user', content: input },
			],
			stream: true,
		});

		let fullResponse = "";
		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content;
			if (content) {
				fullResponse += content;
			}
		}

		return fullResponse;  // JSON-serializable string
	},
	logger
);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const inputMessage = 'foo';

		// Fetch and log the completion
		const completionPromise = fetchCompletion(inputMessage);

		// Stream the response to the client simultaneously
		const encoder = new TextEncoder();
		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					const fullResponse = await completionPromise;
					controller.enqueue(encoder.encode(fullResponse));
				} catch (error) {
					controller.error(error);
				} finally {
					await logger.flush();  // ensures log flush
					controller.close();
				}
			},
		});

		return new Response(readableStream, {
			headers: { 'Content-Type': 'text/plain' },
		});
	},
} satisfies ExportedHandler<Env>;