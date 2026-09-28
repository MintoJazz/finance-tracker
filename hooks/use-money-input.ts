export function useMoneyInput() {
    const obterCentavos = (input: string | number): number => {
        const apenasNumeros = String(input).replace(/\D/g, "");
        return Number(apenasNumeros) || 0;
    };

    return { obterCentavos }
}