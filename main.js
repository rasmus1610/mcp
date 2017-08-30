const vm = new Vue({
  el: '#root',
  data: {
    coins: {

    },
    showModal: false,
    currentCoin: '',
    currentAmount: null
  },
  created: function() {

    if (localStorage.getItem('coins') != 'null') {
      this.coins = JSON.parse(localStorage.getItem('coins'))
    }

    this.getNewData()
  },
  watch: {
    coins: function(newCoins) {
      localStorage.setItem('coins', JSON.stringify(newCoins))
    }
  },
  methods: {
    value: function(coin) {
       return +(coin.price * coin.amount).toFixed(2)
    },
    sum: function(coins) {
      return Object.keys(coins)
        .map(key => this.value(coins[key]) )
        .reduce((sum, value) => sum + value, 0)
        .toFixed(2)
    },
    getNewData: function() {

      Object.keys(this.coins).forEach( coin => {
        this.$http.get(`https://api.cryptonator.com/api/ticker/${coin}-eur`).then(res => {
          this.coins[coin].price = +res.body.ticker.price
        })
      })
    },
    addNewCoin: function(e) {
      if (!(this.currentCoin in this.coins)) {
        const names = {
          xmr: 'Monero (XMR)',
          btc: 'Bitcoin (BTC)',
          eth: 'Ethereum (ETH)'
        }

        const coinObj = {
          amount: +this.currentAmount,
          name: names[this.currentCoin],
          price: null
        }

        Vue.set(vm.coins, this.currentCoin, coinObj)

        this.getNewData()
      } else {
        console.log('coin exists')
        this.coins[this.currentCoin].amount += +this.currentAmount
      }

      this.currentCoin = null
      this.currentAmount = null

      this.showModal = false
    },
    deleteCoin: function(key) {
      console.log(key)
      Vue.delete(vm.coins, key)
    }
   }
})
