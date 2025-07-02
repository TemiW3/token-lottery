import {
  TokenlotteryAccount,
  getCloseInstruction,
  getTokenlotteryProgramAccounts,
  getTokenlotteryProgramId,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '@project/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { generateKeyPairSigner } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'

export function useTokenlotteryProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getTokenlotteryProgramId(cluster.id), [cluster])
}

export function useTokenlotteryProgram() {
  const { client, cluster } = useWalletUi()
  const programId = useTokenlotteryProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}

export function useTokenlotteryInitializeMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      const tokenlottery = await generateKeyPairSigner()
      return await signAndSend(getInitializeInstruction({ payer: signer, tokenlottery }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await queryClient.invalidateQueries({ queryKey: ['tokenlottery', 'accounts', { cluster }] })
    },
    onError: () => toast.error('Failed to run program'),
  })
}

export function useTokenlotteryDecrementMutation({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const invalidateAccounts = useTokenlotteryAccountsInvalidate()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ tokenlottery: tokenlottery.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenlotteryIncrementMutation({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const invalidateAccounts = useTokenlotteryAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ tokenlottery: tokenlottery.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenlotterySetMutation({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const invalidateAccounts = useTokenlotteryAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async (value: number) =>
      await signAndSend(
        getSetInstruction({
          tokenlottery: tokenlottery.address,
          value,
        }),
        signer,
      ),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenlotteryCloseMutation({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const invalidateAccounts = useTokenlotteryAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(getCloseInstruction({ payer: signer, tokenlottery: tokenlottery.address }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useTokenlotteryAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useTokenlotteryAccountsQueryKey(),
    queryFn: async () => await getTokenlotteryProgramAccounts(client.rpc),
  })
}

function useTokenlotteryAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useTokenlotteryAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}

function useTokenlotteryAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['tokenlottery', 'accounts', { cluster }]
}
