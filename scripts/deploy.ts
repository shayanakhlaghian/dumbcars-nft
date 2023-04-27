import {writeFile} from 'fs/promises';
import {join} from 'path';
import {ethers} from 'hardhat';

(async () => {
  try {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying DumbCarsNFT with the account: ', deployer.address);

    const balance = await deployer.getBalance();
    console.log("Deployer's balance is: ", balance.toString());

    const dumbCarsFactory = await ethers.getContractFactory('DumbCarsNFT');
    const dumbCars = await dumbCarsFactory.deploy();
    console.log('Deployed to the network.');
    console.log("Contract's address: ", dumbCars.address);

    await writeFile(
      join(__dirname, '../dumbcars.txt'),
      dumbCars.address,
      'utf-8'
    );
    console.log('Done.');
  } catch (err) {
    console.log('Error: ', err);
  }
})();
