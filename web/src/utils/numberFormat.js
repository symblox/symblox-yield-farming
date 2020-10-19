export function formatNumberPrecision(data, decimals = 6) {
    return Math.floor(parseFloat(data) * 10 ** decimals) / 10 ** decimals;
}

export function toStringDecimals (numStr, decimals, decimalPlace = decimals) {
    numStr = numStr.toLocaleString().replace(/,/g, "");
    decimals = decimals.toString();

    var str = Number(`1e+${decimals}`)
        .toLocaleString()
        .replace(/,/g, "")
        .slice(1);

    var res = (numStr.length > decimals
        ? numStr.slice(0, numStr.length - decimals) +
            "." +
            numStr.slice(numStr.length - decimals)
        : "0." + str.slice(0, str.length - numStr.length) + numStr
    ).replace(/(0+)$/g, "");

    if (decimalPlace === 0) return res.slice(0, res.indexOf("."));

    var length = res.indexOf(".") + 1 + decimalPlace;
    res = res
        .slice(0, length >= res.length ? res.length : length)
        .replace(/(0+)$/g, "");
    return res.slice(-1) === "." ? res + "00" : res;
};
