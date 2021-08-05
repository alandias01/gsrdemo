import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography } from "@material-ui/core";
import { MESSAGE, ISnapshot, IL2Update } from './Main';

export function OrderGrid(props: { snapshot?: ISnapshot, l2Update?: IL2Update }) {

  const [bids, setBids] = useState<any>({});
  const [asks, setAsks] = useState<any>({});
  const [bidsToShow, setBidsToShow] = useState<string[][]>([["0", "0"]]);
  const [asksToShow, setAsksToShow] = useState<string[][]>([["0", "0"]]);
  const [spread, setSpread] = useState("NA");

  useEffect(() => {
    if (props.snapshot?.type !== MESSAGE.DATATYPE.SNAPSHOT) return;

    const bidsObject = Object.fromEntries(props.snapshot.bids);
    const bidsToShowArray = props.snapshot.bids.slice(0, 10);
    setBids(bidsObject);
    setBidsToShow(bidsToShowArray);

    const asksObject = Object.fromEntries(props.snapshot.asks);
    const asksToShowArray = props.snapshot.asks.slice(0, 10).reverse();
    setAsks(asksObject);
    setAsksToShow(asksToShowArray);

    const sp = getSpread(asksToShowArray, bidsToShowArray);
    setSpread(sp);
  }, [props.snapshot]);

  useEffect(() => {
    if (props.l2Update?.type !== MESSAGE.DATATYPE.L2UPDATE) return;

    const bidAskChanges = props.l2Update.changes[0];
    const side = bidAskChanges[0];
    const price = bidAskChanges[1];
    const size = bidAskChanges[2];

    if (side === MESSAGE.SIDE.BUY) updateBids(price, size);
    else if (side === MESSAGE.SIDE.SELL) updateAsks(price, size);
    else { }

  }, [props.l2Update]);


  const sorterBids = (a: any, b: any) => {
    let result = 0;
    try {
      const p1 = parseFloat(a[0]);
      const p2 = parseFloat(b[0]);
      result = p2 - p1;
    } catch (error) {
    }

    return result;
  }

  const sorterAsks = (a: any, b: any) => {
    let result = 0;
    try {
      const p1 = parseFloat(a[0]);
      const p2 = parseFloat(b[0]);
      result = p1 - p2;
    } catch (error) {
    }

    return result;
  }

  function updateBids(price: string, size: string) {
    const updatedData = { ...bids };
    if (price in bids) {
      if (parseFloat(size) === 0) {
        delete updatedData[price];
      }
      else {
        updatedData[price] = size;
      }
      const updatedDataToShow = Object.entries<string>(updatedData).slice(0, 10);
      setBids(updatedData);
      setBidsToShow(updatedDataToShow);
    }
    //Add new price
    else {
      updatedData[price] = size;
      const updatedDataSorted = Object.entries<string>(updatedData).sort(sorterBids);

      const updatedDataToShow = updatedDataSorted.slice(0, 10);
      const updatedDataSortedObject = Object.fromEntries(updatedDataSorted);
      setBids(updatedDataSortedObject);
      setBidsToShow(updatedDataToShow);
    }
    const sp = getSpread(asksToShow, bidsToShow);
    setSpread(sp);
  }

  function updateAsks(price: string, size: string) {
    const updatedData = { ...asks };
    if (price in asks) {
      if (parseFloat(size) === 0) {
        delete updatedData[price];
      }
      else {
        updatedData[price] = size;
      }
      const updatedDataToShow = Object.entries<string>(updatedData).slice(0, 10).reverse();
      setAsks(updatedData);
      setAsksToShow(updatedDataToShow);
    }
    //Add new price
    else {
      updatedData[price] = size;
      const updatedDataSorted = Object.entries<string>(updatedData).sort(sorterAsks);

      const updatedDataToShow = updatedDataSorted.slice(0, 10).reverse();
      const updatedDataSortedObject = Object.fromEntries(updatedDataSorted);
      setAsks(updatedDataSortedObject);
      setAsksToShow(updatedDataToShow);
    }
    const sp = getSpread(asksToShow, bidsToShow);
    setSpread(sp);
  }

  const getSpread = (asksArray: string[][], bidsArray: string[][]) => {
    if (asksArray.length < 10 || bidsArray.length < 10) return "NA";
    const lowestAskString = asksArray[9][0];
    const highestBidString = bidsArray[0][0];

    const lowestAsk = parseFloat(lowestAskString);
    const highestBid = parseFloat(highestBidString);
    let spread = lowestAsk - highestBid;
    return spread.toFixed(6);
  }

  return (
    <div style={{ width: 300, margin: 5 }}>
      <Grid container>
        <Grid container style={{ backgroundColor: "#1f2638" }}>
          <Grid item xs={6} style={{ padding: 5 }}>PRICE</Grid>
          <Grid item xs={6} style={{ padding: 5 }}>SIZE</Grid>
        </Grid>
        <Grid container style={{ height: 300 }}>
          {asksToShow.map(arrItem => (
            <Grid container style={{ backgroundColor: "#171f29" }}>
              <Grid item xs={6} style={{ padding: 5, color: "#eb6a61" }} >{arrItem[0]}</Grid>
              <Grid item xs={6} style={{ padding: 5 }}>{arrItem[1]}</Grid>
            </Grid>))}
        </Grid>

        <Grid container style={{ backgroundColor: "#0d1117" }}>
          <Grid item>
            <Typography variant="h3">{spread} </Typography>
          </Grid>
        </Grid>

        <Grid container style={{ height: 300 }}>
          {bidsToShow.map(arrItem => (
            <Grid container style={{ backgroundColor: "#171f29" }}>
              <Grid item xs={6} style={{ padding: 5, color: "#01aa78" }} >{arrItem[0]}</Grid>
              <Grid item xs={6} style={{ padding: 5 }}>{arrItem[1]}</Grid>
            </Grid>))}
        </Grid>

      </Grid>
    </div>
  );
}