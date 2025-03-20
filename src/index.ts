import { initLogger, wrapOpenAI } from "braintrust";
import OpenAI from "openai";


export default {
	async fetch(request, env, ctx): Promise<Response> {
		const logger = initLogger({
			projectName: "Cloudflare",
			apiKey: env.BRAINTRUST_API_KEY,
			asyncFlush: false,
		});

		const openaiClient = wrapOpenAI(new OpenAI({
			apiKey: env.OPENAI_API_KEY,
		}));

		const stream = await openaiClient.chat.completions.create({
			model: 'gpt-4o-2024-11-20',
			messages: [
				{
					role: 'system',
					content: 'You are a helpful assistant that can do various tasks...',
				},
				{
					role: 'user',
					content: 'foo',
				},
			],
			stream: true,
		});

		// Return the streamed response
		return new Response(stream.toReadableStream(), {
			headers: { 'Content-Type': 'text/plain' },
		});
	},
} satisfies ExportedHandler<Env>;
