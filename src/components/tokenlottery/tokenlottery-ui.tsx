import { ellipsify } from '@wallet-ui/react'
import {
  useTokenlotteryAccountsQuery,
  useTokenlotteryCloseMutation,
  useTokenlotteryDecrementMutation,
  useTokenlotteryIncrementMutation,
  useTokenlotteryInitializeMutation,
  useTokenlotteryProgram,
  useTokenlotteryProgramId,
  useTokenlotterySetMutation,
} from './tokenlottery-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExplorerLink } from '../cluster/cluster-ui'
import { TokenlotteryAccount } from '@project/anchor'
import { ReactNode } from 'react'

export function TokenlotteryProgramExplorerLink() {
  const programId = useTokenlotteryProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

export function TokenlotteryList() {
  const tokenlotteryAccountsQuery = useTokenlotteryAccountsQuery()

  if (tokenlotteryAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!tokenlotteryAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {tokenlotteryAccountsQuery.data?.map((tokenlottery) => <TokenlotteryCard key={tokenlottery.address} tokenlottery={tokenlottery} />)}
    </div>
  )
}

export function TokenlotteryProgramGuard({ children }: { children: ReactNode }) {
  const programAccountQuery = useTokenlotteryProgram()

  if (programAccountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!programAccountQuery.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return children
}

function TokenlotteryCard({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokenlottery: {tokenlottery.data.count}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink address={tokenlottery.address} label={ellipsify(tokenlottery.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <TokenlotteryButtonIncrement tokenlottery={tokenlottery} />
          <TokenlotteryButtonSet tokenlottery={tokenlottery} />
          <TokenlotteryButtonDecrement tokenlottery={tokenlottery} />
          <TokenlotteryButtonClose tokenlottery={tokenlottery} />
        </div>
      </CardContent>
    </Card>
  )
}

export function TokenlotteryButtonInitialize() {
  const mutationInitialize = useTokenlotteryInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Tokenlottery {mutationInitialize.isPending && '...'}
    </Button>
  )
}

export function TokenlotteryButtonIncrement({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const incrementMutation = useTokenlotteryIncrementMutation({ tokenlottery })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}

export function TokenlotteryButtonSet({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const setMutation = useTokenlotterySetMutation({ tokenlottery })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', tokenlottery.data.count.toString() ?? '0')
        if (!value || parseInt(value) === tokenlottery.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}

export function TokenlotteryButtonDecrement({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const decrementMutation = useTokenlotteryDecrementMutation({ tokenlottery })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}

export function TokenlotteryButtonClose({ tokenlottery }: { tokenlottery: TokenlotteryAccount }) {
  const closeMutation = useTokenlotteryCloseMutation({ tokenlottery })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
