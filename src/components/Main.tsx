import React, { useEffect, useState, useRef } from "react";
import { Button, CssBaseline, TextField, Grid } from "@material-ui/core";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { OrderGrid } from './OrderGrid';
import { LogWindowComponent } from './LogWindowComponent'
import { Message } from "@material-ui/icons";

export const MESSAGE = {
  DATATYPE: {
    SNAPSHOT: "snapshot",
    L2UPDATE: "l2update"
  },
  SIDE: {
    BUY: "buy",
    SELL: "sell"
  }
}

export interface ISnapshot {
  type: string;
  product_id: string;
  asks: string[][];
  bids: string[][];
}

export interface IL2Update {
  type: string;
  product_id: string;
  changes: string[][];
}

const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#394873"
    },
    secondary: {
      main: "#303556"
    },
    background: {
      default: "#080e15"
    }
  },
  typography: {
    fontFamily: ['"Segoe UI"'].join(','),
    fontSize: 13,
    fontWeightRegular: 600
  },
  overrides: {
    MuiOutlinedInput: {
      input: {
        padding: "8.5px 14px"
      }
    }
  }
})

export function Main() {
  const ws = useRef<WebSocket | null>(null);
  const coinbaseWebsocketUrl = "wss://ws-feed-public.sandbox.pro.coinbase.com";

  const [cryptoPair, setCryptoPair] = useState("BTC-USD");
  const [snapshot, setSnapshot] = useState<ISnapshot>();
  const [l2Update, setL2Update] = useState<IL2Update>();
  const [logData, setLogData] = useState<string[]>(["Start"]);

  useEffect(() => {
    ws.current = new WebSocket(coinbaseWebsocketUrl);
    ws.current.onopen = handleWebSocketOpen;
    ws.current.onmessage = processMessage;
  }, []);

  const handleWebSocketOpen = (e: Event) => console.log("Connected to: " + (e.target as WebSocket).url);

  const processMessage = (msg: MessageEvent) => {
    const logMsg = "On Message: " + msg.data;
    console.log(logMsg);
    setLogData(x => [...x, logMsg]);

    const data = JSON.parse(msg.data);

    switch (data.type) {
      case MESSAGE.DATATYPE.SNAPSHOT:
        processMessageSnapshot(data);
        break;
      case MESSAGE.DATATYPE.L2UPDATE:
        processMessageL2Update(data);
        break;

      default:
        break;
    }
  }

  const processMessageSnapshot = (data: any) => {
    const { type, product_id, asks, bids } = data;
    setSnapshot({ type, product_id, asks, bids });
  }

  const processMessageL2Update = (data: any) => {
    const { type, product_id, changes } = data;
    setL2Update({ type, product_id, changes });
  }

  const handleSubscribe = () => {
    handleUnsubscribe();
    const msg = {
      "type": "subscribe",
      "product_ids": [
        cryptoPair,
      ],
      "channels": [
        "level2"
      ]
    };
    ws.current?.send(JSON.stringify(msg));
  }

  const handleUnsubscribe = () => {
    const msg = {
      "type": "unsubscribe",
      "channels": ["level2"]
    };
    ws.current?.send(JSON.stringify(msg));
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ margin: 20 }}>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              InputLabelProps={{ shrink: true }}
              label="Crypto Pair"
              variant="outlined"
              style={{ margin: 5, width: 150 }}
              value={cryptoPair}
              onChange={(e) => setCryptoPair(e.target.value)}
            />
            <Button onClick={handleSubscribe} variant="outlined" style={{ margin: 5 }}>Subscribe</Button>
            <Button onClick={handleUnsubscribe} variant="outlined" style={{ margin: 5 }}>Unsubscribe</Button>

            <br />
            <OrderGrid snapshot={snapshot} l2Update={l2Update} />
          </Grid>
          <Grid item xs={6} >
            <LogWindowComponent logData={logData} />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}