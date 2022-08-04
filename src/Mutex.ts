export class Mutex {
	prom: Promise<void>;
	resolver: {(): void} = () => void 0;
	constructor () {
		this.prom = new Promise(res => {
			this.resolver = res;
			this.unlock();
		});
	}

	unlock() {
		this.resolver();
	}

	lock(): Promise<void> {
		const out = this.prom;
		this.prom = new Promise(res => {
			
		});
	}
}
