import { render } from "@react-email/render";
import type { FC } from "react";
import type { AdapterConfigMap } from "../interfaces/channelMap";
import type { SendWithTemplateOptions } from "../interfaces/interface";

interface NotificationServiceOptions {
	channels: Partial<AdapterConfigMap>;
	templates: Record<string, FC>;
}

export class NotificationService {
	#worker: Worker;

	constructor(public options: NotificationServiceOptions) {
		this.#worker = this.#createWorker();
	}

	#createWorker() {
		const url = new URL("./NotificationWorker", import.meta.url).href;
		return new Worker(url);
	}

	#compileTemplate(template: string, data: any) {
		const Template = this.options.templates[template];
		return render(<Template {...data} />);
	}

	onMessage(callback: (message: any) => void) {
		this.#worker.addEventListener("message", (event) => {
			callback(event.data);
		});
	}

	onError(callback: (error: string) => void) {
		this.#worker.addEventListener("error", (event) => {
			callback(event.message);
		});
	}

	unmount() {
		this.#worker.terminate();
	}

	send<C extends keyof AdapterConfigMap>(options: SendWithTemplateOptions<C>) {
		const content = this.#compileTemplate(options.template, options.data);

		this.#worker.postMessage({
			config: this.options.channels[options.channel],
			// @ts-ignore
			sendOptions: { ...options, content },
		});
	}
}
