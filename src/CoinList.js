import React from 'react';
import styled from 'styled-components';
import {subtleBoxShadow, lightBlueBackground, greenBoxShadow} from './Style';

const CoinGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 15px;
`

const CoinTitle = styled.div`
  ${subtleBoxShadow};
  ${lightBlueBackground};
  padding: 10px;
  &:hover{
    cursor: pointer;
    ${greenBoxShadow};
  }
`

export default function() {
  return <CoinGrid>
    {Object.keys(this.state.coinList).map(coin => 
      <CoinTitle>
        {coin}
      </CoinTitle>
    )}
  </CoinGrid>
}

// export default function() {
//   return <div>
//     {Object.keys(this.state.coinList).length}
//   </div>
// }