import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Transfer } from '../../generated/schema'

import { getGlobalId } from '../utils'

export function getOrCreateTransfer(
	punk: BigInt | null,
	event: ethereum.Event
): Transfer {
	let transfer = Transfer.load(getGlobalId(event).concat('-TRANSFER'))
	if (!transfer) {
		transfer = new Transfer(getGlobalId(event).concat('-TRANSFER'))
	}

	//find out how they differ & where to find them
	//transfer.from = fromAddress.toHexString();
	//transfer.to = toAddress.toHexString();
	//transfer.nft = punk.toString() // null by default, updated in transfer handler

	transfer.timestamp = event.block.timestamp
	transfer.contract = event.address.toHexString()
	transfer.blockNumber = event.block.number
	transfer.txHash = event.transaction.hash
	transfer.logNumber = event.logIndex
	transfer.blockHash = event.block.hash
	transfer.type = 'TRANSFER'

	transfer.save()
	return transfer as Transfer
}
