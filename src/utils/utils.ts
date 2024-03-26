import { getCurrentInstance } from 'vue';

/* Helper function for digitFormat */
const needFix = (value: string, bit = 'some'): string => {
	return value.includes('.') || value.includes(',')
		? `${Number(value).toFixed(1)}${bit}`
		: `${Math.trunc(Number(value))}${bit}`;
};
/* Large number format change function 1000 -> 1K, 1000000-> 1M */
export const digitFormat = (labelValue: number): number | string => {
	if (Math.abs(Number(labelValue)) >= 1.0e6) {
		// Six Zeroes for Millions
		const stringValue = String(Math.abs(Number(labelValue)) / 1.0e6);
		return needFix(stringValue, 'M');
	}
	const stringValue = String(Math.abs(Number(labelValue)) / 1.0e3);
	return Math.abs(Number(labelValue)) >= 1.0e3 // Three Zeroes for Thousands
		? needFix(stringValue, 'K')
		: replaceNumberFormat(labelValue);
};

export const inputMask = (val: string): string => {
	let a = val;
	a = a.replace(',', '.'); // 0,5 => 0.5
	if (a.search(/\./) === 0) a = 0 + a; // .5 => 0.5
	a = a.replace(/[^(\d|\.|\-)]/g, ''); // s.sd5a => 0.5
	a = a.replace(/^([^\.]*\.)|\./g, '$1'); // 0.5.5 => 0.55
	return a;
};

export const inputDecimalsMask = (val: string, dec = 3): string => {
	let a = val;
	a = a.replace(',', '.'); // 0,5 => 0.5
	if (a.search('.') === 0) a = a.replace(/^\./, '0.'); // .5 => 0.5
	if (a.search('-.') === 0) a = a.replace('-.', '-0.'); // -.5 => -0.5
	if (a.search('-') === 0) {
		a = a.replace(/[^(\d|.)]/g, ''); // s.sd5a => 0.5
		a = `-${a}`;
	} else {
		a = a.replace(/[^(\d|.)]/g, ''); // s.sd5a => 0.5
	}
	a = a.replace(/^([^.]*\.)|\./g, '$1'); // 0.5.5 => 0.55
	if (a.search(/\./) > -1) {
		a = a.substr(0, a.search(/\./) + dec + 1); // 0.558 => 0.55
	}
	return a;
};

export const findTheNumberOfNumbersAfterTheDecimalPoint = (value: string): number => {
	// @ts-ignore
	return value.includes('.') ? value.split('.').pop().length : 0;
};

export const trimByDecimals = (value: string, decimals: number): string => {
	if (findTheNumberOfNumbersAfterTheDecimalPoint(value) > decimals) {
		return Number(value).toFixed(decimals).toString();
	}
	return value;
};

export const convertExponentialToDecimal = (value: number): number | string => {
	if (!value) {
		return '';
	}
	const string = value.toString();
	if (string.includes('e')) {
		const base = string.split('e')[0];
		const exponent = string.split('e')[1];
		const exponentNumber = parseInt(exponent);
		const decimals = base.includes('.') ? base.split('.')[1].length : 0;
		if (exponentNumber < 0) {
			return value.toFixed(decimals - exponentNumber);
		}
		let decimalOrder = '';
		for (let i = 0; i < exponentNumber - decimals; i += 1) {
			decimalOrder += '0';
		}
		return base.replace('.', '') + decimalOrder;
	}
	return value;
};

export const replaceNumberFormat = (number: number, locale = 'ru-RU', decimals = 8): string => {
	return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(number);
};

// todo: think about the correctness of working with large numbers
/**
 * emphasize on:
 * now with number 30672.38 and decimals = 16
 * result 30672.38000000005 which is not correct
 */
export const toFixedDecimals = (number: number, decimal: number): number => {
	if (number) {
		const exponent = 10 ** decimal;
		const result = Number(Number(number).toFixed(decimal));
		return Math.trunc(result * exponent) / exponent;
	}
	return 0;
};

export const formatNumberAndFixedDecimals = (value: number, locale = 'ru-RU', decimal: number): string => {
	if (isNaN(value)) {
		return value as unknown as string;
	}

	const fixedToDecimals = toFixedDecimals(value, decimal);
	return replaceNumberFormat(fixedToDecimals, locale, decimal);
};

export const getFullDate = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	}).format(new Date(fixDateFormat));
};

export const getDateFull = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		year: '2-digit',
		month: 'numeric',
		day: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const getDateWithYearLong = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const getDateFullShort = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const getDate = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		day: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const getTimeFull = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const getTime = (val: string | number, locale: string): string => {
	const fixDateFormat =
		!isNaN(parseFloat(val as string)) && isFinite(val as number) ? val : (val as string).replace(/\s/, 'T');
	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	}).format(new Date(fixDateFormat));
};

export const formatDate = (time: number, full: boolean): string => {
	const seconds = Math.floor((time / 1000) % 60);
	const minutes = Math.floor((time / 1000 / 60) % 60);
	const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

	return full
		? `${hours}:${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}`
		: `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}`;
};

export const timerTick = (endTime: number, full = true): string => {
	const now = Date.now();
	const time = endTime - now;
	return formatDate(time, full);
};

export const ellipsisString = ({
	value,
	ellipsisLength = 10,
	replacement = '***'
}: {
	value: string;
	ellipsisLength?: number;
	replacement?: string;
}): string => {
	if (!value) return '';

	if (value.length <= ellipsisLength) {
		return value;
	}

	const halfLength = Math.round(ellipsisLength / 2);
	const firstHalf = value.slice(0, halfLength);
	const secondHalf = value.slice(value.length - halfLength);
	return firstHalf.concat(replacement, secondHalf);
};

export const csvGenerator = ({
	dataArrayInit,
	fileName,
	separatorInit,
	addQuotes,
	removeAfterDownload = false
}: Record<string, any>): any => {
	const dataArray = dataArrayInit;
	let separator = separatorInit || ',';

	if (Boolean(addQuotes)) {
		separator = '"' + separator + '"';
	}

	const getDownloadLink = (): any => {
		const rows = dataArray.map((row: any) => {
			const rowData = row.join(separator);

			if (rowData.length && addQuotes) {
				return '"' + rowData + '"';
			}

			return rowData;
		});

		const data = rows.join('\n');
		const blob = new Blob([data], { type: 'text/csv;charset=UTF-8;' });

		if (navigator.msSaveBlob) {
			// IE 10+
			navigator.msSaveBlob(blob, fileName);
		} else {
			return URL.createObjectURL(blob);
		}
	};

	const getLinkElement = (linkText: any = ''): any => {
		const downloadLink = getDownloadLink();
		const linkElement = ((): any => {
			const a = document.createElement('a');
			a.innerHTML = linkText || '';
			a.href = downloadLink;
			a.download = fileName;
			return a;
		})();
		return linkElement;
	};

	// call with removeAfterDownload = true if you want the link to be removed after downloading
	const download = (removeAfterDownload: any): any => {
		const linkElement = getLinkElement();
		linkElement.style.display = 'none';
		document.body.appendChild(linkElement);
		linkElement.click();
		if (removeAfterDownload) {
			document.body.removeChild(linkElement);
		}
	};

	return download(removeAfterDownload);
};

export const pluralize = (n: number, textForms: Array<string>): string => {
	n = Math.abs(n) % 100;
	const n1 = n % 10;
	if (n > 10 && n < 20) {
		return textForms[2];
	}
	if (n1 > 1 && n1 < 5) {
		return textForms[1];
	}
	if (n1 == 1) {
		return textForms[0];
	}
	return textForms[2];
};

export async function encode(message: string, algorithm: AlgorithmIdentifier = 'SHA-256'): Promise<string> {
	const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8); // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}

export async function encodePassword({
	identificator,
	password,
	algorithm = 'old'
}: SECURITY.EncodePasswordParams): Promise<string> {
	if (algorithm === 'old') {
		const passwordHash = await encode(password);
		return encode(passwordHash + identificator);
	}

	const passwordHash = await encode(password);
	return encode(passwordHash);
}

export function useRoute(): any {
	//@ts-ignore
	const { proxy } = getCurrentInstance();
	const route = proxy.$route;
	return route;
}
export function useRouter(): any {
	//@ts-ignore
	const { proxy } = getCurrentInstance();
	const router = proxy.$router;
	return router;
}

export function useTranslate(): any {
	//@ts-ignore
	const { proxy } = getCurrentInstance();
	const t = proxy.$t;
	return t;
}

export function useHref(): any {
	//@ts-ignore
	const { proxy } = getCurrentInstance();
	const href = proxy.$href;
	return href;
}

export function getDepositFeeValue(transport: WALLETS.DepositTransactionMethod, currency: string): string {
	const { absFee, maxFee, percFee, minFee } = transport;
	if (maxFee && absFee && percFee && minFee) {
		return `${absFee} ${currency} + ${percFee}% (min ${minFee} ${currency}, max ${maxFee} ${currency})`;
	} else if (absFee && percFee && maxFee) {
		return `${absFee} ${currency} + ${percFee}% (max ${maxFee} ${currency})`;
	} else if (absFee && percFee && minFee) {
		return `${absFee} ${currency} + ${percFee}% (min ${minFee} ${currency})`;
	} else if (minFee && percFee && maxFee) {
		return `${percFee}% (min ${minFee} ${currency}, max ${maxFee} ${currency})`;
	} else if (absFee && percFee) {
		return `${absFee} ${currency} + ${percFee}%`;
	} else if (maxFee && percFee) {
		return `${percFee}% (max ${maxFee} ${currency})`;
	} else if (minFee && percFee) {
		return `${percFee}% (min ${minFee} ${currency})`;
	} else if (percFee && !absFee) {
		return `${percFee}%`;
	} else if (absFee && !percFee) {
		return `${absFee} ${currency}`;
	} else {
		return `0 ${currency}`;
	}
}
