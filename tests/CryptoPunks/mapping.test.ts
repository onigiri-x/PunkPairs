import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import {
  assert,
  test,
  newMockEvent,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import { log } from "matchstick-as/assembly/log";
import { clearStore, logStore } from "matchstick-as/assembly/store";
import {
  Assign,
  PunkTransfer,
  cryptopunks,
  PunkNoLongerForSale,
  PunkBidEntered,
  PunkOffered,
  PunkBought,
} from "../../generated/cryptopunks/cryptopunks";
import {
  ProxyRegistered,
  Transfer as WrappedPunkTransfer,
} from "../../generated/WrappedPunks/WrappedPunks";
import {
  handleAssign,
  handleProxyRegistered,
  handlePunkNoLongerForSale,
  handlePunkTransfer,
  handleWrappedPunkTransfer,
  handlePunkBidEntered,
  handlePunkOffered,
  handlePunkBought,
} from "../../src/mapping";

import { WRAPPED_PUNK_ADDRESS, ZERO_ADDRESS } from "../../src/constant";
import { MetaData, Sale } from "../../generated/schema";

const OWNER1 = "0x6f4a2d3a4f47f9c647d86c929755593911ee0001";
const OWNER2 = "0xc36817163b7eaef25234e1d18adbfa52105a0002";
const OWNER3 = "0xb4cf0f5f2ffed445ca804898654366316d0a0003";
const PROXY2 = "0x674578060c0f07146bcc86d12b8a2efa1e810002";

const CRYPTOPUNKS_ADDRESS = Address.fromString(
  "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb"
);

createMockedFunction(
  Address.fromString(WRAPPED_PUNK_ADDRESS),
  "symbol",
  "symbol():(string)"
).returns([ethereum.Value.fromString("WPUNKS")]);

createMockedFunction(
  Address.fromString(WRAPPED_PUNK_ADDRESS),
  "name",
  "name():(string)"
).returns([ethereum.Value.fromString("Wrapped Cryptopunks")]);

createMockedFunction(
  Address.fromString(WRAPPED_PUNK_ADDRESS),
  "totalSupply",
  "totalSupply():(uint256)"
).returns([ethereum.Value.fromI32(1)]);

function createBlock(number: i32): ethereum.Block {
  let mockEvent = newMockEvent();

  let block = mockEvent.block;
  block.number = BigInt.fromI32(number);
  return block;
}

function createAssign(to: Address, punkIndex: i32): Assign {
  let mockEvent = newMockEvent();

  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  parameters.push(
    new ethereum.EventParam("punkIndex", ethereum.Value.fromI32(punkIndex))
  );

  createMockedFunction(
    CRYPTOPUNKS_ADDRESS,
    "symbol",
    "symbol():(string)"
  ).returns([ethereum.Value.fromString("Ͼ")]);

  createMockedFunction(CRYPTOPUNKS_ADDRESS, "name", "name():(string)").returns([
    ethereum.Value.fromString("CryptoPunks"),
  ]);

  createMockedFunction(
    CRYPTOPUNKS_ADDRESS,
    "imageHash",
    "imageHash():(string)"
  ).returns([
    ethereum.Value.fromString(
      "ac39af4793119ee46bbff351d8cb6b5f23da60222126add4268e261199a2921b"
    ),
  ]);

  createMockedFunction(
    CRYPTOPUNKS_ADDRESS,
    "totalSupply",
    "totalSupply():(uint256)"
  ).returns([ethereum.Value.fromI32(1)]);

  let assignEvent = new Assign(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(1),
    mockEvent.transaction,
    parameters
  );

  return assignEvent;
}

function createPunkTransferEvent(
  from: Address,
  to: Address,
  punkIndex: i32,
  blockNumber: i32 = 1000
): PunkTransfer {
  let mockEvent = newMockEvent();

  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  parameters.push(
    new ethereum.EventParam("punkIndex", ethereum.Value.fromI32(punkIndex))
  );

  let transferEvent = new PunkTransfer(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(blockNumber),
    mockEvent.transaction,
    parameters
  );

  return transferEvent;
}

function createWrappedPunkTransfer(
  from: Address,
  to: Address,
  tokenId: i32,
  blockNumber: i32 = 2
): WrappedPunkTransfer {
  let mockEvent = newMockEvent();

  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  parameters.push(
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId))
  );

  let transferEvent = new WrappedPunkTransfer(
    Address.fromString(WRAPPED_PUNK_ADDRESS),
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(blockNumber),
    mockEvent.transaction,
    parameters
  );

  return transferEvent;
}

function createPunkNoLongerForSaleEvent(punkIndex: i32): PunkNoLongerForSale {
  let mockEvent = newMockEvent();
  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("punkIndex", ethereum.Value.fromI32(punkIndex))
  );

  let PunkNoLongerForSaleEvent = new PunkNoLongerForSale(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(3),
    mockEvent.transaction,
    parameters
  );
  return PunkNoLongerForSaleEvent;
}

function createPunkBidEntered(
  punkIndex: i32,
  bid: i32,
  bidder: Address
): PunkBidEntered {
  let mockEvent = newMockEvent();
  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("punkIndex", ethereum.Value.fromI32(punkIndex))
  );

  parameters.push(new ethereum.EventParam("bid", ethereum.Value.fromI32(bid)));

  parameters.push(
    new ethereum.EventParam("bidder", ethereum.Value.fromAddress(bidder))
  );

  let PunkBidEnteredEvent = new PunkBidEntered(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(4),
    mockEvent.transaction,
    parameters
  );
  return PunkBidEnteredEvent;
}

function createPunkOffered(
  punkIndex: i32,
  offer: i32,
  offeredBy: Address
): PunkOffered {
  let mockEvent = newMockEvent();
  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("punkIndex", ethereum.Value.fromI32(punkIndex))
  );

  parameters.push(
    new ethereum.EventParam("offer", ethereum.Value.fromI32(offer))
  );

  parameters.push(
    new ethereum.EventParam("offeredBy", ethereum.Value.fromAddress(offeredBy))
  );

  let PunkOfferedEvent = new PunkOffered(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(4),
    mockEvent.transaction,
    parameters
  );
  return PunkOfferedEvent;
}

function createProxyRegisteredEvent(
  user: Address,
  proxy: Address
): ProxyRegistered {
  let mockEvent = newMockEvent();

  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  );
  parameters.push(
    new ethereum.EventParam("proxy", ethereum.Value.fromAddress(proxy))
  );

  let proxyRegisteredEvent = new ProxyRegistered(
    Address.fromString(WRAPPED_PUNK_ADDRESS),
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(3),
    mockEvent.transaction,
    parameters
  );

  return proxyRegisteredEvent;
}

function createPunkBoughtEvent(
  punk: i32,
  value: i32,
  seller: Address,
  buyer: Address
): PunkBought {
  let mockEvent = newMockEvent();

  let parameters = new Array<ethereum.EventParam>();

  parameters.push(
    new ethereum.EventParam("punk", ethereum.Value.fromI32(punk))
  );
  parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromI32(value))
  );

  parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  );
  parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  );

  let punkBoughtEvent = new PunkBought(
    CRYPTOPUNKS_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    createBlock(3),
    mockEvent.transaction,
    parameters
  );

  return punkBoughtEvent;
}

/////////////////////////////////////////////////////////////////////////////////////
//TEST ASSIGN
///////////////////////////////////////////
test("test handleAssign", () => {
  log.warning("test handleAssign", []);
  let assignEvent = createAssign(Address.fromString(OWNER1), 1);
  createMockedFunction(CRYPTOPUNKS_ADDRESS, "name", "name():(string)").returns([
    ethereum.Value.fromString("CryptoPunks"),
  ]);

  handleAssign(assignEvent);

  assert.fieldEquals("Account", OWNER1, "numberOfPunksOwned", "1");
  assert.fieldEquals(
    "Contract",
    CRYPTOPUNKS_ADDRESS.toHexString(),
    "name",
    "CryptoPunks"
  );

  assert.fieldEquals("MetaData", "1-1-METADATA", "punk", "1");
  assert.fieldEquals("Punk", "1", "metadata", "1-1-METADATA");
  assert.fieldEquals("Punk", "1", "wrapped", "false");
});
///////////////////////////////////////////
//TEST PUNK TRANSFER
///////////////////////////////////////////

test("test Transfer", () => {
  let transferEvent = createPunkTransferEvent(
    Address.fromString(OWNER1),
    Address.fromString(OWNER2),
    1,
    1
  );
  handlePunkTransfer(transferEvent);
  assert.fieldEquals("Account", OWNER1, "numberOfPunksOwned", "0");
  assert.fieldEquals("Account", OWNER2, "numberOfPunksOwned", "1");
  // logStore();
});

///////////////////////////////////////////
//TEST WRAP
///////////////////////////////////////////

/**
 * Example: https://etherscan.io/tx/0x83f2c4b428b2ee5cf0c317fe72bb39716ca2e4d93597b3d80a8a2e60aa698d22
 * 1. registerProxy
 * 2. send Punk to Proxy
 * 3.1 transfer Punk from Proxy to wrapped punks
 * 3.2 transfer WrappedPunk from 0x0 to owner
 * Owner: 0xb4cf0f5f2ffed445ca804898654366316d0a779a
 * User Proxy: 0x674578060c0f07146BcC86D12B8a2efA1e819C38
 *
 */

test("testWrap", () => {
  assert.fieldEquals("Punk", "1", "owner", OWNER2);

  handleProxyRegistered(
    createProxyRegisteredEvent(
      Address.fromString(OWNER2),
      Address.fromString(PROXY2)
    )
  );

  assert.fieldEquals("UserProxy", PROXY2, "user", OWNER2);

  handlePunkTransfer(
    createPunkTransferEvent(
      Address.fromString(OWNER2),
      Address.fromString(PROXY2),
      1,
      4
    )
  );

  assert.fieldEquals("Account", OWNER2, "numberOfPunksOwned", "1");

  handlePunkTransfer(
    createPunkTransferEvent(
      Address.fromString(PROXY2),
      Address.fromString(WRAPPED_PUNK_ADDRESS),
      1,
      5
    )
  );

  // logStore();

  assert.fieldEquals("Account", OWNER2, "numberOfPunksOwned", "1");
  assert.fieldEquals("Punk", "1", "wrapped", "true");
});

///////////////////////////////////////////
//WRAPPED TRANSFER
///////////////////////////////////////////

test("testWrappedTransfer", () => {
  assert.fieldEquals("Punk", "1", "wrapped", "true");
  assert.fieldEquals("Punk", "1", "owner", OWNER2);

  handleWrappedPunkTransfer(
    createWrappedPunkTransfer(
      Address.fromString(OWNER2),
      Address.fromString(OWNER3),
      1,
      6
    )
  );
  assert.fieldEquals("Punk", "1", "wrapped", "true");
  assert.fieldEquals("Punk", "1", "owner", OWNER3);
  assert.fieldEquals("Account", OWNER2, "numberOfPunksOwned", "0");
  assert.fieldEquals("Account", OWNER3, "numberOfPunksOwned", "1");

  // logStore();
});

///////////////////////////////////////////
//TEST UNWRAP
///////////////////////////////////////////

test("testUnwrap", () => {
  assert.fieldEquals("Punk", "1", "wrapped", "true");

  handlePunkTransfer(
    createPunkTransferEvent(
      Address.fromString(WRAPPED_PUNK_ADDRESS),
      Address.fromString(OWNER3),
      1,
      5
    )
  );
  assert.fieldEquals("Punk", "1", "wrapped", "false");
  assert.fieldEquals("Punk", "1", "owner", OWNER3);
  assert.fieldEquals("Account", OWNER3, "numberOfPunksOwned", "1");

  // logStore();
});

test("Test Sale ID", () => {
  log.warning("Test Sale ID", []);
  handlePunkBought(
    createPunkBoughtEvent(
      1,
      100,
      Address.fromString(OWNER1),
      Address.fromString(OWNER2)
    )
  );

  logStore();
});
///////////////////////////////////////////
//TEST PUNKOFFERED
///////////////////////////////////////////

// test("test PunkOffer", () => {
//   clearStore();
//   //Handle Assign creates the punks otherwise punkId will be null
//   handleAssign(createAssign(Address.fromString(ZERO_ADDRESS), 1));
//   handleAssign(createAssign(Address.fromString(OWNER1), 2));

//   handlePunkOffered(createPunkOffered(1, 1, Address.fromString(ZERO_ADDRESS)));
//   handlePunkOffered(createPunkOffered(2, 1, Address.fromString(OWNER1)));
//   handlePunkTransfer(
//     createPunkTransferEvent(
//       Address.fromString(WRAPPED_PUNK_ADDRESS),
//       Address.fromString(OWNER3),
//       1,
//       7
//     )
//   );

//   assert.fieldEquals("Punk", "1", "wrapped", "false");
//   assert.fieldEquals("Punk", "1", "owner", OWNER3);
//   assert.fieldEquals("Account", OWNER3, "numberOfPunksOwned", "1");

//   assert.fieldEquals("Punk", "2", "owner", OWNER1);
//   logStore();
// });

// test("test PunkNoLongerForSale", () => {
//   let PunkNoLongerForSaleEvent = createPunkNoLongerForSaleEvent(1);
//   handlePunkNoLongerForSale(PunkNoLongerForSaleEvent);
//   //assert.fieldEquals("AskCreated", "1-100-ASKCREATED", "nft", "1");
//   // logStore();
// });

// test("test PunkBidEntered", () => {
//   let PunkBidEnteredEvent = createPunkBidEntered(
//     1,
//     100000,
//     Address.fromString(OWNER1)
//   );
//   handlePunkBidEntered(PunkBidEnteredEvent);
//   assert.fieldEquals(
//     "BidRemoved",
//     "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-BIDREMOVED",
//     "type",
//     "BID_REMOVED"
//   );
//   // logStore();
// });
