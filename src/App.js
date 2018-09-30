import React, { Component } from 'react';
import './App.css';
import styled, {css} from 'styled-components';
import AppBar from './AppBar';
import cc from 'cryptocompare';
import CoinList from './CoinList';

const AppLayout = styled.div`
  padding: 40px;
`
const Content = styled.div`

`
const checkFirstVisit = () => {
  let crytoDashData = localStorage.getItem('cryptoDash')
  if(!crytoDashData) {
    return {
      firstVisit: true,
      page: 'settings'
    }
  }
  return {};
}

class App extends Component {
  state = {
    page: 'settings',
    ...checkFirstVisit()
  }
  componentDidMount = async () => {
    //fetch coins
    let coinList = (await cc.coinList()).Data;
    this.setState({ coinList });
  }
  fetchCoins = () => {
    console.log('I am fetching coins');
  }
  displayingDashboard = () => this.state.page === 'dashboard'
  displayingSettings = () => this.state.page === 'settings'
  firstVisitMessage = () => {
    if(this.state.firstVisit){
      return <div>Welcome to CryptoDash, please select your favourite coinsto begin.</div>
    }
  }
  confirmFavourites = () => {
    localStorage.setItem('cryptoDash', 'test');
    this.setState({
      firstVisit: false,
      page: 'dashboard'
    })
  }
  settingsContent = () => {
    return <div>
      {this.firstVisitMessage()}
      <div onClick={this.confirmFavourites}>
        Confirm Favourites
      </div>
      <div>
        {CoinList.call(this)}
      </div>
    </div>
  }
  loadingContent = () => {
    if(!this.state.coinList) {
      return <div> Loading Coins </div>
    }
  }
  render() {
    return (
      <AppLayout>
        {AppBar.call(this)}
        {this.loadingContent() || <Content>
          {this.displayingSettings() && this.settingsContent()}
        </Content>}
      </AppLayout>
    );
  }
}

export default App;