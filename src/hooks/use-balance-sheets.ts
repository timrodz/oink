import { api } from "@/lib/api";
import type { BalanceSheet, Entry } from "@/lib/types/balance-sheets";
import { useState, useCallback, useEffect } from "react";

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
