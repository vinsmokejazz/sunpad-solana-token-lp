import React, { useRef } from 'react'

const TokenLaunchpad = () => {

  const TokenForm = ()=>{
    // declaring refs
    const nameRef = useRef();
    const symbolRef = useRef();
    const imageRef = useRef();
    const supplyRef = useRef();

    const createToken = ()=>{
      // access the value via current
      const name = nameRef.current.value;
      const symbol = symbolRef.current.value;
      const image =  imageRef.current.value;
      const intialSupply = supplyRef.current.value;
    }
  }

  return (
    <div>
      <h1>Solana Token LaunchPad</h1>
      <input ref={nameRef} type='text' placeholder="Token name"/>
       <input ref={symbolRef} type="text" placeholder="Symbol" />
      <input ref={imageRef} type="text" placeholder="Image URL" />
      <input ref={supplyRef} type="number" placeholder="Initial Supply" />

      <button onClick={createToken}>Mint Token</button>
      
    </div>
  )
}

export default TokenLaunchpad
