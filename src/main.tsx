import React from 'react'
import ReactDOM from 'react-dom/client'
import BellCurve from './BellCurve'
import D3Curve from './D3Curve'
import D3Curve1 from './D3Curve1'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <BellCurve /> */}
    {/* <D3Curve /> */}
    <D3Curve1 />
  </React.StrictMode>,
)
