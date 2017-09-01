const vm = new Vue({
  el: '#root',
  data: {
    coins: {},
    showModal: false,
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
    addNewCoin: function({ coin, amount }) {
      if (!(coin in this.coins) && coin in names) {
        const names = {
          xrp: 'Ripple (XRP)',
          btc: 'Bitcoin (BTC)',
          eth: 'Ethereum (ETH)',
          ltc: 'Litecoin (LTC)',
          bch: 'Bitcoin Cash (BCH)'
        }

        const coinObj = {
          amount: +amount,
          name: names[coin],
          price: null
        }

        Vue.set(vm.coins, coin, coinObj)

        this.getNewData()
      } else {
        console.log('coin exists')
        this.coins[coin].amount += +amount
      }

      this.showModal = false
    },
    deleteCoin: function(key) {
      console.log(key)
      Vue.delete(vm.coins, key)
    },
  },
  components: {
    'coin-modal': {
      template: `
        <div class="add-coin-modal">
          <div class="add-coin-modal__modal">
            <h2>Add new coin</h2>
            <form class="add-coin-form" @submit.prevent="addCoin">
              <select v-model="currentCoin">
                <option value="btc" selected>Bitcoin</option>
                <option value="eth">Ethereum</option>
                <option value="ltc">Litecoin</option>
                <option value="bch">Bitcoin Cash</option>
                <option value="xrp">Ripple</option>
              </select>
              <input type="number" v-model="currentAmount" placeholder="amount" step="0.000001" />
              <input type="submit" value="add" :disabled="disabledSubmit"/>
            </form>
            <a href="#" @click.prevent="closeModal">close</a>
          </div>
        </div>
      `,
      data: function() {
        return {
          currentCoin: '',
          currentAmount: null
        }
      },
      computed: {
        disabledSubmit: function() {
          const nonValidAmount = (this.currentAmount == '' || this.currentAmount == 0 || this.currentAmount == null || +this.currentAmount < 0 )
          const nonValidCoin = this.currentCoin == ''

          return nonValidCoin || nonValidAmount
        }
      },
      methods: {
        closeModal: function() {
          this.$emit('close-modal')
        },
        addCoin: function() {
          this.$emit('add-coin', { coin: this.currentCoin, amount: this.currentAmount })

          this.currentCoin = ''
          this.currentAmount = null
        }
      }
    },
    'coin-list': {
      template: `
        <ul class="coin-list">
          <li v-for="(coin, key) in coins" class="coin-list__item">
            <p class="coin-list__item-value"><span> {{ coin.amount }} {{ coin.name }} <a href="#" @click.prevent="deleteCoin(key)" class="coin-list__item-delete">delete</a></span> <span>{{ value(coin) }}€</span></p>
            <p class="coin-list__item-price">current price: {{ coin.price ? coin.price.toFixed(2) : "N/A" }}€</p>
          </li>
        </ul>
      `,
      props: ['coins', 'value'],
    }
  }
})
