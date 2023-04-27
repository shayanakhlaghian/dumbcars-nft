import type {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {ethers} from 'hardhat';
import {expect} from 'chai';

import type {DumbCarsNFT} from '../typechain-types';

describe('DumbCarsNFT', () => {
  let signers: SignerWithAddress[];
  let dumbCars: DumbCarsNFT;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const dumbCarsFactory = await ethers.getContractFactory('DumbCarsNFT');
    dumbCars = await dumbCarsFactory.deploy();
  });

  it('deploys a contract.', async () => {
    expect(dumbCars).not.equal(undefined);
  });

  it('does not let anyone other than the owner enable public mint', async () => {
    try {
      await dumbCars.connect(signers[1]).setIsPublicMintEnabled(true);
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('lets the owner enable public mint.', async () => {
    await dumbCars.setIsPublicMintEnabled(true);

    const isPublicMintEnabled = await dumbCars.isPublicMintEnabled();
    expect(isPublicMintEnabled).to.equal(true);
  });

  it('does not let another other than owner set base token uri.', async () => {
    try {
      await dumbCars.connect(signers[1]).setBaseTokenUri('TEST');
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('lets the owner set base token uri.', async () => {
    const TEST_BASE_TOKEN_URI = 'TEST_BASE_TOKEN_URI';

    await dumbCars.setBaseTokenUri(TEST_BASE_TOKEN_URI);

    const baseTokenUri = await dumbCars.baseTokenUri();
    expect(baseTokenUri).to.equal(TEST_BASE_TOKEN_URI);
  });

  it('does not let minting if public mint is not enabled.', async () => {
    try {
      await dumbCars.connect(signers[1]).mint(1);
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('does not let minting if collection is sold out.', async () => {
    try {
      await dumbCars.setIsPublicMintEnabled(true);

      for (let i = 0; i < 12; i++) {
        await dumbCars
          .connect(signers[i])
          .mint(2, {value: ethers.utils.parseEther('0.02')});
      }

      await dumbCars
        .connect(signers[19])
        .mint(2, {value: ethers.utils.parseEther('0.02')});
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('does not let minting if the sent value is wrong.', async () => {
    try {
      await dumbCars.setIsPublicMintEnabled(true);

      await dumbCars
        .connect(signers[1])
        .mint(2, {value: ethers.utils.parseEther('0.01')});
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('does not let minting if the quantity is larger than the max per wallet.', async () => {
    try {
      await dumbCars.setIsPublicMintEnabled(true);

      await dumbCars
        .connect(signers[1])
        .mint(3, {value: ethers.utils.parseEther('0.03')});
    } catch (err) {
      return;
    }

    throw new Error('Should not have reached this line.');
  });

  it('lets minting.', async () => {
    await dumbCars.setIsPublicMintEnabled(true);

    await dumbCars
      .connect(signers[1])
      .mint(1, {value: ethers.utils.parseEther('0.01')});

    const walletMints = await dumbCars.walletMints(signers[1].address);
    expect(walletMints).to.equal(1);
  });
});
