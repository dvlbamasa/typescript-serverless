interface Config {
	MATCH_TABLE?: string;
}

export default {
	...process.env,
} as Config;
