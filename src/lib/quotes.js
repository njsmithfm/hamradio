export const quotes = [
	'Live long and prosper',
	'Infinite diversity in infinite combinations',
	'Resistance is futile',
	'Make it so',
	'Engage!',
	'Logic is the beginning of wisdom, not the end',
	'to be human is to make yourself more than you are',
	'Openness, optimism and the spirit of curiosity',
	'Things are only impossible until they are not',
	'It is the unknown that defines our existence',
	'Vamoose ya little varmint',
	'The glory of creation is in its infinite diversity',
	'Jolan tru',
	'Voka a Bentel'
];

export function randomQuote() {
	const i = Math.floor(Math.random() * quotes.length);
	return quotes[i].toUpperCase();
}
