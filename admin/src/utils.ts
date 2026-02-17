
export const normalizeString = (str: string) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
};

export const searchMatch = (text: string, query: string) => {
    if (!query) return true;
    return normalizeString(text).includes(normalizeString(query));
};

