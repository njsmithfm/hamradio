export const quotes = [
	'Live long and prosper',
	'Infinite diversity in infinite combinations',
	'Resistance is futile',
	'Make it so!',
	'Engage!',
	'The needs of the many outweigh the needs of the few',
	'Logic is the beginning of wisdom, not the end',
	'what it is to be human: To make yourself more than you are',
	'Openness, optimism and the spirit of curiosity',
	'Things are only impossible until they are not',
	"It's the unknown that defines our existence",
	'Vamoose, ya little varmint'
];

export function randomQuote() {
	const i = Math.floor(Math.random() * quotes.length);
	return quotes[i];
}
