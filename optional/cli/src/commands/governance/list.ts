import { valueToString } from '@planq-network/contractkit/lib/wrappers/BaseWrapper'
import { concurrentMap } from '@planq-network/utils/lib/async'
import { zip } from '@planq-network/utils/lib/collections'
import chalk from 'chalk'
import { cli } from 'cli-ux'
import { BaseCommand } from '../../base'

export default class List extends BaseCommand {
  static description = 'List live governance proposals (queued and ongoing)'

  static flags = {
    ...BaseCommand.flags,
    ...(cli.table.flags() as object),
  }

  static examples = ['list']

  async run() {
    const res = this.parse(List)

    const governance = await this.kit.contracts.getGovernance()
    const queue = await governance.getQueue()
    const expiredQueueMap = await concurrentMap(5, queue, (upvoteRecord) =>
      governance.isQueuedProposalExpired(upvoteRecord.proposalID)
    )
    const unexpiredQueue = queue.filter((_, idx) => !expiredQueueMap[idx])
    const sortedQueue = governance.sortedQueue(unexpiredQueue)

    console.log(chalk.magenta.bold('Queued Proposals:'))
    cli.table(
      sortedQueue,
      {
        ID: { get: (p) => valueToString(p.proposalID) },
        upvotes: { get: (p) => valueToString(p.upvotes) },
      },
      res.flags
    )

    const dequeue = await governance.getDequeue(true)
    const expiredDequeueMap = await concurrentMap(5, dequeue, governance.isDequeuedProposalExpired)
    const unexpiredDequeue = dequeue.filter((_, idx) => !expiredDequeueMap[idx])
    const stages = await concurrentMap(5, unexpiredDequeue, governance.getProposalStage)
    const proposals = zip((proposalID, stage) => ({ proposalID, stage }), unexpiredDequeue, stages)

    console.log(chalk.blue.bold('Dequeued Proposals:'))
    cli.table(
      proposals,
      {
        ID: { get: (p) => valueToString(p.proposalID) },
        stage: {},
      },
      res.flags
    )

    console.log(chalk.red.bold('Expired Proposals:'))
    const expiredQueue = queue
      .filter((_, idx) => expiredQueueMap[idx])
      .map((_, idx) => queue[idx].proposalID)
    const expiredDequeue = dequeue
      .filter((_, idx) => expiredDequeueMap[idx])
      .map((_, idx) => dequeue[idx])
    cli.table(
      expiredQueue.concat(expiredDequeue),
      {
        ID: { get: (id) => valueToString(id) },
      },
      res.flags
    )
  }
}
