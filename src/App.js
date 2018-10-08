import React, { Component } from 'react';
import './App.css';
import styled, {css} from 'styled-components';
import AppBar from './AppBar';
import Search from './Search';
import Dashboard from './Dashboard';
import {ConfirmButton} from './Button';
import cc from 'cryptocompare';
import _ from 'lodash';
import fuzzy from 'fuzzy';
import CoinList from './CoinList';


const AppLayout = styled.div`
  padding: 40px;
`
const Content = styled.div`

`
const CenterDiv = styled.div`
  display: grid;
  justify-content: center;
`

const MAX_FAVORITES = 10;

const checkFirstVisit = () => {
  let cryptoDashData = JSON.parse(localStorage.getItem('cryptoDash'));
  if(!cryptoDashData) {
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  return {
    favorites: cryptoDashData.favorites
  };
}

class App extends Component {
  state = {
    page: 'dashboard',
    favorites: ['BTC', 'ETH', 'XMR'],
    ...checkFirstVisit()
  }
  componentDidMount = async () => {
    //fetch coins
    this.fetchCoins();
    this.fetchPrices();
  }
  fetchCoins = async () => {
    let coinList = (await cc.coinList()).Data;
    this.setState({ coinList });
  }
  fetchPrices = async () => {
    let prices;
    try {
      prices = await this.prices();
    } catch(e) {
      this.setState({error:true});
    }
    console.log(prices);
    this.setState({prices});
  }
  prices = () => {
    let promises = [];
    this.state.favorites.forEach(sym => {
      promises.push(cc.priceFull(sym, 'USD'));
    })
    return Promise.all(promises);
  }

  displayingDashboard = () => this.state.page === 'dashboard'
  displayingSettings = () => this.state.page === 'settings'
  firstVisitMessage = () => {
    if(this.state.firstVisit){
      return <div>Welcome to CryptoDash, please select your favourite coinsto begin.</div>
    }
  }
  confirmFavourites = () => {
    this.setState({
      firstVisit: false,
      page: 'dashboard',
      prices: null
    })
    this.fetchPrices();
    localStorage.setItem('cryptoDash', JSON.stringify({
      favorites: this.state.favorites
    }));
  }
  settingsContent = () => {
    return <div>
      {this.firstVisitMessage()}
      <div>
        {CoinList.call(this, true)}
        <CenterDiv>
          <ConfirmButton onClick={this.confirmFavourites}>
            Confirm Favourites
          </ConfirmButton>
        </CenterDiv>
        {Search.call(this)}
        {CoinList.call(this)}
      </div>
    </div>
  }
  loadingContent = () => {
    if(!this.state.coinList) {
      return <div> Loading Coins </div>
    }
    if(!this.state.prices) {
      return <div> Loading Prices </div>
    }
  }
  addCoinToFavorites = (key) => {
    let favorites = [...this.state.favorites];
    if(favorites.length < MAX_FAVORITES){
      favorites.push(key);
      this.setState({favorites});
    }
  }
  removeCoinFromFavorites = (key) => {
    let favorites= [...this.state.favorites];
    this.setState({favorites: _.pull(favorites, key)});
  }
  isInFavorites = (key) => _.includes(this.state.favorites, key)
  handleFilter = _.debounce((inputValue) => {
    // Get all the coin symbols
    let coinSymbols = Object.keys(this.state.coinList);
    let coinNames = coinSymbols.map(sym => this.state.coinList[sym].CoinName);
    let allStringsToSearch = coinSymbols.concat(coinNames);
    let fuzzyResults = fuzzy.filter(inputValue, allStringsToSearch, {}).map(result => result.string);
    let filteredCoins = _.pickBy(this.state.coinList, (result, symkey) => {
      let coinName = result.CoinName;
      // If our fuzzy results contains this symbol or the coin name, include it (return true)
      return _.includes(fuzzyResults, symkey) || _.includes(fuzzyResults, coinName);
    })
    this.setState({ filteredCoins })
  }, 500)
  filterCoins = (e) => {
    let inputValue = _.get(e, 'target.value');
    if(!inputValue) {
      this.setState({
        filteredCoins: null
      });
      return;
    }
    this.handleFilter(inputValue);
  }
  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
        {this.loadingContent() || <Content>
          {this.displayingSettings() && this.settingsContent()}
          {this.displayingDashboard() && Dashboard.call(this)}
        </Content>}
      </AppLayout>
    );
  }
}

export default App;
