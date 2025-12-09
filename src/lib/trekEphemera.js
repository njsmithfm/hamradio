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

export function toStardate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	const yy = String(year).slice(-2);
	const mm = String(month).padStart(2, '0');
	const dd = String(day).padStart(2, '0');

	const stardate = `${yy}${mm}.${dd}`;
	return stardate;
}
