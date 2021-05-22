modified from https://github.com/jirawatee/LINE-Bot-Gold-Reporter but for report farm status

### How to use:

1. fork this project
2. setup secret environment https://github.com/{yourname}/LINE-BOT-Farm-Status/settings/secrets/actions
    - BSC_ADDRESS
    - LINE_AUTHORIZATION

### add other farm list

edit 
```js
const FARM_LIST = [
  { name: "Pancakeswap", key: "pancake-bsc" },
  { name: "Dopple Finance", key: "dopple" },
];
```