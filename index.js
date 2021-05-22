const axios = require("axios");

const LINE_MESSAGING_API = "https://api.line.me/v2/bot";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.LINE_AUTHORIZATION}`,
};

const APE_BOARD_API = "https://api.apeboard.finance";
const BSC_TOKEN = process.env.BSC_ADDRESS;
const FARM_LIST = [
  { name: "Pancakeswap", key: "pancake-bsc" },
  { name: "Dopple Finance", key: "dopple" },
];

const getWalletTotal = async () => {
  const response = await axios.get(`${APE_BOARD_API}/wallet/bsc/${BSC_TOKEN}`);
  return {
    name: "wallet",
    value: response.data,
  };
};

const getFarm = async (pool) => {
  const response = await axios.get(`${APE_BOARD_API}/${pool.key}/${BSC_TOKEN}`);
  return {
    ...pool,
    farms: response.data.farms,
  };
};

const getFarmTotal = () =>
  Promise.all(FARM_LIST.map(getFarm)).then((pools) => ({
    name: "pools",
    value: pools,
  }));

const getWalletBalance = (wallets) => {
  return wallets.reduce((acc, wallet) => {
    return acc + wallet.balance * wallet.price;
  }, 0);
};

const getWalletWindow = (wallet) => {
  return new Promise((resolve) => {
    const sum = getWalletBalance(wallet);

    const view = {
      type: "box",
      layout: "vertical",
      margin: "xxl",
      spacing: "sm",
      contents: [
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "Wallet",
              flex: 3,
            },
            {
              type: "text",
              text: `$${sum.toFixed(3)}`,
              wrap: true,
              color: "#E2C05B",
              flex: 2,
              align: "end",
            },
          ],
        },
        {
          type: "separator",
        },
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "Assets",
              flex: 2,
            },
            {
              type: "text",
              text: `Balance`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `Price`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `Value`,
              flex: 1,
              size: "sm",
              align: "end",
            },
          ],
        },
        ...wallet.map((asset) => ({
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "icon",
              url: asset.logo,
              size: "sm",
            },
            {
              type: "text",
              text: asset.symbol.toUpperCase(),
              flex: 2,
            },
            {
              type: "text",
              text: `${asset.balance.toFixed(3)}`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `${asset.price.toFixed(3)}`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `${(asset.price * asset.balance).toFixed(3)}`,
              flex: 1,
              size: "sm",
              align: "end",
            },
          ],
        })),
      ],
    };
    resolve(view);
  });
};

const getTotalPrice = (tokens) => {
  return tokens.reduce((acc, token) => acc + token.balance * token.price, 0);
};

const getFarmBalance = (farms) => {
  return farms.reduce((acc, farm) => {
    const fromToken = getTotalPrice(farm.tokens);
    const fromReward = getTotalPrice(farm.rewards);
    return acc + fromToken + fromReward;
  }, 0);
};

const getFarmWindow = (pool) => {
  return new Promise((resolve) => {
    const sum = getFarmBalance(pool.farms);

    const view = {
      type: "box",
      layout: "vertical",
      margin: "xxl",
      spacing: "sm",
      contents: [
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: `${pool.name}`,
              flex: 3,
            },
            {
              type: "text",
              text: `$${sum.toFixed(3)}`,
              wrap: true,
              color: "#E2C05B",
              flex: 2,
              align: "end",
            },
          ],
        },
        {
          type: "separator",
        },
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "Assets",
              flex: 2,
            },
            {
              type: "text",
              text: `Balance`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `Rewards`,
              flex: 1,
              size: "sm",
              align: "end",
            },
            {
              type: "text",
              text: `Value`,
              flex: 1,
              size: "sm",
              align: "end",
            },
          ],
        },
        ...pool.farms.map((farm) => {
          const fromToken = getTotalPrice(farm.tokens);
          const fromReward = getTotalPrice(farm.rewards);

          return {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: farm.tokens
                  .map((token) => token.symbol.toUpperCase())
                  .join("+"),
                flex: 2,
              },
              {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: `${fromToken.toFixed(3)}`,
                    flex: 1,
                    size: "sm",
                    align: "end",
                  },
                  ...farm.tokens.map((token) => ({
                    type: "text",
                    text: `${token.balance.toFixed(3)}`,
                    flex: 1,
                    size: "sm",
                    align: "end",
                  })),
                ],
              },
              {
                type: "text",
                text: `${fromReward.toFixed(3)}`,
                flex: 1,
                size: "sm",
                align: "end",
              },
              {
                type: "text",
                text: `${(fromToken + fromReward).toFixed(3)}`,
                flex: 1,
                size: "sm",
                align: "end",
              },
            ],
          };
        }),
      ],
    };
    resolve(view);
  });
};

const getNetWorth = (model) => {
  return new Promise((resolve) => {
    const sumWallet = getWalletBalance(model.wallet);

    const sumFarm = model.pools.reduce((acc, pool) => {
      const sum = getFarmBalance(pool.farms);
      return acc + sum;
    }, 0);

    resolve({
      type: "box",
      layout: "vertical",
      margin: "xxl",
      spacing: "sm",
      contents: [
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: `Total:`,
              flex: 2,
            },
            {
              type: "text",
              text: `$${(sumWallet + sumFarm).toFixed(3)}`,
              flex: 2,
              wrap: true,
              color: "#E2C05B",
              align: "end",
            },
          ],
        },
      ],
    });
  });
};

const broadcast = async (priceCurrent) => {
  const model = priceCurrent.reduce(
    (acc, list) => ({ ...acc, [list.name]: list.value }),
    {}
  );

  let windows = await Promise.all([
    getNetWorth(model),
    {
      type: "separator",
    },
    getWalletWindow(model.wallet),
    ...model.pools.map(getFarmWindow),
  ]);

  windows = windows.reduce(
    (acc, asset) => [
      ...acc,
      {
        type: "filler",
      },
      asset,
    ],
    []
  );

  const message = JSON.stringify({
    messages: [
      {
        type: "flex",
        altText: "Flex Message",
        contents: {
          type: "bubble",
          size: "giga",
          body: {
            type: "box",
            layout: "vertical",
            paddingAll: "8%",
            backgroundColor: "#FFF9E2",
            contents: [
              {
                type: "text",
                text: "Total Assets",
                weight: "bold",
                size: "xl",
                align: "center",
              },
              ...windows,
            ],
          },
        },
      },
    ],
  })

  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/broadcast`,
    headers: LINE_HEADER,
    data: message,
  });
};

Promise.all([getWalletTotal(), getFarmTotal()]).then(broadcast);
