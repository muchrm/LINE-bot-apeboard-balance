const axios = require("axios");

const LINE_MESSAGING_API = "https://api.line.me/v2/bot";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: "Bearer YOUR-CHANNEL-ACCESS-TOKEN",
};

const APE_BOARD_API = "https://api.line.me/v2/bot";
const BSC_TOKEN = `YOUR-BSC-ADDRESS`;

const FARM_LIST = [
  { name: "Pancakeswap", key: "pancake-bsc" },
  { name: "Dopple Finance", key: "dopple" },
];

const getWalletTotal = async () => {
  const response = await axios.get(
    `${APE_BOARD_API}/wallet/user/bsc/${BSC_TOKEN}`
  );
  const results = response.data;
  return {
    name: "Wallet",
    value: Math.round(
      results.reduce((acc, wallet) => {
        return acc + wallet.balance * wallet.price;
      }, 0),
      2
    ),
  };
};

const getFarmTotal = async (farmPortal) => {
  const response = await axios.get(
    `${APE_BOARD_API}/${farmPortal.key}/${BSC_TOKEN}`
  );
  const results = response.data;
  return {
    ...farmPortal,
    value: Math.round(
      results.farms.reduce((acc, farm) => {
        const fromToken = farm.tokens.reduce(
          (acc, token) => acc + token.balance * token.price,
          0
        );
        const fromReward = farm.reward.balance * farm.reward.price;
        return acc + fromToken + fromReward;
      }, 0)
    ),
  };
};

const broadcast = (priceCurrent) => {
  return axios({
    method: "post",
    url: `${LINE_MESSAGING_API}/message/broadcast`,
    headers: LINE_HEADER,
    data: JSON.stringify({
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
                {
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
                          text: "Value",
                          wrap: true,
                          color: "#E2C05B",
                          flex: 5,
                          align: "end",
                        },
                      ],
                    },
                    {
                      type: "box",
                      layout: "baseline",
                      spacing: "sm",
                      contents: [
                        {
                          type: "text",
                          text: "Wallet",
                          flex: 4,
                        },
                        {
                          type: "text",
                          text: `${priceCurrent[0].value}$`,
                          flex: 1,
                          size: "sm",
                          align: "end",
                        },
                      ],
                    },
                    {
                      type: "separator",
                    },
                    ...priceCurrent.slice(1).map((farm) => ({
                      type: "box",
                      layout: "baseline",
                      spacing: "sm",
                      contents: [
                        {
                          type: "text",
                          text: farm.name,
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `${farm.value}$`,
                          flex: 1,
                          size: "sm",
                          align: "end",
                        },
                      ],
                    })),
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
                          text: "Total",
                          flex: 3,
                        },
                        {
                          type: "text",
                          text: `${priceCurrent.reduce(
                            (acc, farm) => acc + farm.value,
                            0
                          )}$`,
                          flex: 1,
                          size: "sm",
                          align: "end",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    }),
  });
};

Promise.all([getWalletTotal(), ...FARM_LIST.map(getFarmTotal)]).then(broadcast);
