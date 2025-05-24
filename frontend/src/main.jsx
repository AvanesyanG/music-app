import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import PlayerContextProvider from "./context/PlayerContext.jsx";
import {ClerkProvider} from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
              <PlayerContextProvider>
                  <App />
              </PlayerContextProvider>
          </ClerkProvider>
      </BrowserRouter>
  </StrictMode>,
)
