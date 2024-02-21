const networkConfig = {
  31337: {
    name: "Hardhat",
  },
  11155111: {
    name: "Sepolia",
    ethPriceUsd: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  137: {
    name: "Polygon",
    ethPriceUsd: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
};
const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
};
