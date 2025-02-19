import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { CryptoPunksData } from '../generated/CryptoPunksData/CryptoPunksData'
import { Punk, MetaData } from '../generated/schema'

export function handleBlock(block: ethereum.Block): void {
	if (
		block.number.gt(BigInt.fromI32(13047091)) &&
		block.number.lt(BigInt.fromI32(13057091))
	) {
		let index = block.number.minus(BigInt.fromI32(13047091)).toI32()

		let data = CryptoPunksData.bind(
			Address.fromString('0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2')
		)

		//  let attributes = data.punkAttributes(BigInt.fromI32(index));
		let svg = data.punkImageSvg(index)
		let image = data.punkImage(index)

		let punk = Punk.load(index.toString())!
		let metadata = MetaData.load(index.toString())!

		metadata.image = image.toString()
		metadata.svg = svg.toString()

		punk.metadata = metadata.id

		punk.save()
		metadata.save()
	}
}
