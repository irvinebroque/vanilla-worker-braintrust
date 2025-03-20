import { initLogger, wrapOpenAI, wrapTraced } from "braintrust";

import {
  streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const logger = initLogger({
			projectName: "My Project",
			apiKey: env.BRAINTRUST_API_KEY,
			asyncFlush: false,
		  });

          const openai = wrapOpenAI(createOpenAI({
            apiKey: env.OPENAI_API_KEY,
          }));

          // Stream the AI response using GPT-4
          const result = streamText({
            model: openai("gpt-4o-2024-11-20"),
            system: `You are a helpful assistant that can do various tasks...`,
            messages: [
				{
					role: 'user',
					content: 'foo'
				}
			],
            maxSteps: 10,
          });

		  console.log(result);

		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
