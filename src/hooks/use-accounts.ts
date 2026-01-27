import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/lib/types/accounts";

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
