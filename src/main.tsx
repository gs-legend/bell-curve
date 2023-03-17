import React from 'react'
import ReactDOM from 'react-dom/client'
import BellCurve from './BellCurve'
import D3Curve from './D3Curve'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* <BellCurve /> */}
    <D3Curve />
  </React.StrictMode>,
)
