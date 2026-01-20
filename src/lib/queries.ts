import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { Account, BalanceSheet, CurrencyRate, Entry } from "./types";

// TODO: all `use<Name>` features should be placed into their own hooks

export function useBalanceSheets() {
  const [data, setData] = useState<BalanceSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceSheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sheets = await api.getBalanceSheets();
      setData(sheets);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalanceSheets();
  }, [fetchBalanceSheets]);

  return { data, loading, error, refetch: fetchBalanceSheets };
}

export function useAccounts(includeArchived: boolean = false) {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await api.getAllAccounts(includeArchived);
      setData(accounts);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { data, loading, error, refetch: fetchAccounts };
}

export function useToggleArchiveAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleArchive = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.toggleArchiveAccount(id);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate: toggleArchive, loading, error };
}

export function useCreateBalanceSheet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBalanceSheet = async (year: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.createBalanceSheet(year);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate: createBalanceSheet, loading, error };
}

export function useDeleteBalanceSheet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBalanceSheet = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteBalanceSheet(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate: deleteBalanceSheet, loading, error };
}

export function useEntries(balanceSheetId: string | undefined) {
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!balanceSheetId) return;
    setLoading(true);
    setError(null);
    try {
      const entries = await api.getEntries(balanceSheetId);
      setData(entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [balanceSheetId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { data, loading, error, refetch: fetchEntries, setData };
}

export function useUpsertEntry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertEntry = async (
    balanceSheetId: string,
    accountId: string,
    month: number,
    amount: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.upsertEntry(
        balanceSheetId,
        accountId,
        month,
        amount,
      );
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate: upsertEntry, loading, error };
}

export function useCurrencyRates(year?: number) {
  const [data, setData] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allRates = await api.getCurrencyRates();
      if (year) {
        setData(allRates.filter((r) => r.year === year));
      } else {
        setData(allRates);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return { data, loading, error, refetch: fetchRates, setData };
}

export function useUpsertCurrencyRate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertRate = async (
    id: string | null,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    month: number,
    year: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.upsertCurrencyRate(
        id,
        fromCurrency,
        toCurrency,
        rate,
        month,
        year,
      );
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate: upsertRate, loading, error };
}
