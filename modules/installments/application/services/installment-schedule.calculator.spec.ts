import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InstallmentDomainError } from "../policies/installment.policy";
import {
    buildInstallmentSchedule,
    splitInstallmentAmounts,
} from "./installment-schedule.calculator";

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

describe("splitInstallmentAmounts", () => {
    it("divisão exata: todas as parcelas iguais", () => {
        assert.deepEqual(splitInstallmentAmounts(30000, 3), [10000, 10000, 10000]);
    });

    it("com resto: as primeiras valem floor e a última absorve a diferença", () => {
        assert.deepEqual(splitInstallmentAmounts(10000, 3), [3333, 3333, 3334]);
        assert.deepEqual(splitInstallmentAmounts(1000, 7), [142, 142, 142, 142, 142, 142, 148]);
    });

    it("a soma é sempre o total, de 2 a 120 parcelas", () => {
        for (const count of [2, 3, 7, 12, 59, 120]) {
            for (const total of [1, 99, 10000, 123457, 999999]) {
                const amounts = splitInstallmentAmounts(total, count);
                assert.equal(amounts.length, count);
                assert.equal(sum(amounts), total);
                assert.ok(amounts.every((a) => a >= 0));
            }
        }
    });

    it("total menor que o número de parcelas: parcelas zeradas e a última com o total", () => {
        assert.deepEqual(splitInstallmentAmounts(2, 3), [0, 0, 2]);
    });

    it("rejeita total e quantidade inválidos", () => {
        assert.throws(() => splitInstallmentAmounts(0, 3), InstallmentDomainError);
        assert.throws(() => splitInstallmentAmounts(100.5, 3), InstallmentDomainError);
        assert.throws(() => splitInstallmentAmounts(100, 0), InstallmentDomainError);
        assert.throws(() => splitInstallmentAmounts(100, 2.5), InstallmentDomainError);
    });
});

describe("buildInstallmentSchedule", () => {
    it("datas mês a mês a partir da primeira, numeradas de 1 a N", () => {
        const schedule = buildInstallmentSchedule({
            firstDate: "2030-11-15",
            total: 30000,
            count: 3,
        });
        assert.deepEqual(
            schedule.map((s) => [s.number, s.date, s.amount]),
            [
                [1, "2030-11-15", 10000],
                [2, "2030-12-15", 10000],
                [3, "2031-01-15", 10000],
            ]
        );
    });

    it("dia 31 é limitado ao fim do mês sem acumular deslocamento", () => {
        const schedule = buildInstallmentSchedule({
            firstDate: "2031-01-31",
            total: 40000,
            count: 4,
        });
        assert.deepEqual(
            schedule.map((s) => s.date),
            ["2031-01-31", "2031-02-28", "2031-03-31", "2031-04-30"]
        );
    });

    it("ano bissexto e virada de ano", () => {
        const schedule = buildInstallmentSchedule({
            firstDate: "2027-12-31",
            total: 300,
            count: 3,
        });
        assert.deepEqual(
            schedule.map((s) => s.date),
            ["2027-12-31", "2028-01-31", "2028-02-29"]
        );
    });

    it("120 parcelas: a última data é 119 meses depois da primeira", () => {
        const schedule = buildInstallmentSchedule({
            firstDate: "2030-01-10",
            total: 1200000,
            count: 120,
        });
        assert.equal(schedule.length, 120);
        assert.equal(schedule[119].date, "2039-12-10");
        assert.equal(sum(schedule.map((s) => s.amount)), 1200000);
    });
});
